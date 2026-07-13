import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';

dotenv.config();

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// ─── DB connection (cached for serverless) ───────────────────────────────────
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

// ─── Models ──────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.comparePassword = function (p) {
  return bcrypt.compare(p, this.password);
};
const User = mongoose.models.User || mongoose.model('User', userSchema);

const querySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true },
    status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { timestamps: true }
);
const Query = mongoose.models.Query || mongoose.model('Query', querySchema);

// ─── Auth helpers ─────────────────────────────────────────────────────────────
const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

const verifyToken = (req) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  try { return jwt.verify(h.split(' ')[1], process.env.JWT_SECRET); } catch { return null; }
};

const requireAdmin = (req, res, next) => {
  const d = verifyToken(req);
  if (!d) return res.status(401).json({ message: 'Unauthorized' });
  if (d.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  req.user = d; next();
};

const requireUser = (req, res, next) => {
  const d = verifyToken(req);
  if (!d) return res.status(401).json({ message: 'Unauthorized' });
  req.user = d; next();
};

const ok = (data, meta) => ({ success: true, data, ...(meta && { meta }) });

// ─── Middleware: DB connect on every request ──────────────────────────────────
app.use(async (req, res, next) => {
  try { await connectDB(); next(); } catch (e) { res.status(500).json({ message: 'DB connection failed' }); }
});

// ─── Auth routes ─────────────────────────────────────────────────────────────
app.post('/api/auth/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD)
    return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: signToken({ username, role: 'admin' }) });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
  if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: signToken({ id: user._id, name: user.name, email: user.email, role: 'user' }) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: signToken({ id: user._id, name: user.name, email: user.email, role: 'user' }) });
});

// ─── Query routes ─────────────────────────────────────────────────────────────
const qValidate = [
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('customerName').notEmpty(),
  body('customerEmail').isEmail(),
  body('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  (req, res, next) => {
    const e = validationResult(req);
    if (!e.isEmpty()) return res.status(400).json({ errors: e.array() });
    next();
  },
];

// Public submit
app.post('/api/queries/submit', qValidate, async (req, res) => {
  const q = await Query.create(req.body);
  res.status(201).json(ok(q));
});

// User: my queries
app.get('/api/queries/my', requireUser, async (req, res) => {
  const queries = await Query.find({ customerEmail: req.user.email }).sort({ createdAt: -1 });
  res.json(ok(queries));
});

// Admin: stats
app.get('/api/queries/stats', requireAdmin, async (req, res) => {
  const statuses = ['open', 'in-progress', 'resolved', 'closed'];
  const counts = await Promise.all(statuses.map((s) => Query.countDocuments({ status: s })));
  res.json(ok(Object.fromEntries(statuses.map((s, i) => [s, counts[i]]))));
});

// Admin: all queries
app.get('/api/queries', requireAdmin, async (req, res) => {
  const { status, priority, search, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) filter.$or = [{ title: new RegExp(search, 'i') }, { customerName: new RegExp(search, 'i') }];
  const total = await Query.countDocuments(filter);
  const queries = await Query.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  res.json(ok(queries, { total, page: Number(page), limit: Number(limit) }));
});

// Admin: create query
app.post('/api/queries', requireAdmin, qValidate, async (req, res) => {
  const q = await Query.create(req.body);
  res.status(201).json(ok(q));
});

// Any user: get single query
app.get('/api/queries/:id', requireUser, async (req, res) => {
  const q = await Query.findById(req.params.id);
  if (!q) return res.status(404).json({ message: 'Query not found' });
  res.json(ok(q));
});

// Admin: update query
app.put('/api/queries/:id', requireAdmin, qValidate, async (req, res) => {
  const q = await Query.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!q) return res.status(404).json({ message: 'Query not found' });
  res.json(ok(q));
});

// Admin: delete query
app.delete('/api/queries/:id', requireAdmin, async (req, res) => {
  const q = await Query.findByIdAndDelete(req.params.id);
  if (!q) return res.status(404).json({ message: 'Query not found' });
  res.json(ok({ message: 'Query deleted' }));
});

export default app;
