import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';

dotenv.config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));

app.use(express.json());

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed' });
  }
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

const querySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true },
    status: { 
      type: String, 
      enum: ['open', 'in-progress', 'resolved', 'closed'], 
      default: 'open' 
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high'], 
      default: 'medium' 
    },
  },
  { timestamps: true }
);

const Query = mongoose.models.Query || mongoose.model('Query', querySchema);

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
};

const extractTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const requireAdmin = (req, res, next) => {
  const decodedToken = extractTokenFromRequest(req);
  
  if (!decodedToken) {
    return res.status(401).json({ message: 'Unauthorized: No valid token provided' });
  }
  
  if (decodedToken.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  
  req.user = decodedToken;
  next();
};

const requireAuth = (req, res, next) => {
  const decodedToken = extractTokenFromRequest(req);
  
  if (!decodedToken) {
    return res.status(401).json({ message: 'Unauthorized: Please log in' });
  }
  
  req.user = decodedToken;
  next();
};

const formatResponse = (data, meta = null) => {
  const response = { success: true, data };
  if (meta) {
    response.meta = meta;
  }
  return response;
};

app.post('/api/auth/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }
  
  const token = generateToken({ username, role: 'admin' });
  res.json({ token });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'Email is already registered' });
  }
  
  const newUser = await User.create({ name, email, password });
  const token = generateToken({ 
    id: newUser._id, 
    name: newUser.name, 
    email: newUser.email, 
    role: 'user' 
  });
  
  res.status(201).json({ token });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  const user = await User.findOne({ email });
  
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  const token = generateToken({ 
    id: user._id, 
    name: user.name, 
    email: user.email, 
    role: 'user' 
  });
  
  res.json({ token });
});

const validateQuery = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerEmail').isEmail().withMessage('Valid customer email is required'),
  body('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

app.post('/api/queries/submit', validateQuery, async (req, res) => {
  const newQuery = await Query.create(req.body);
  res.status(201).json(formatResponse(newQuery));
});

app.get('/api/queries/my', requireAuth, async (req, res) => {
  const queries = await Query.find({ customerEmail: req.user.email }).sort({ createdAt: -1 });
  res.json(formatResponse(queries));
});

app.get('/api/queries/stats', requireAdmin, async (req, res) => {
  const statuses = ['open', 'in-progress', 'resolved', 'closed'];
  
  const counts = await Promise.all(
    statuses.map((status) => Query.countDocuments({ status }))
  );
  
  const statsObject = {};
  statuses.forEach((status, index) => {
    statsObject[status] = counts[index];
  });
  
  res.json(formatResponse(statsObject));
});

app.get('/api/queries', requireAdmin, async (req, res) => {
  const { status, priority, search, page = 1, limit = 10 } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  
  if (search) {
    filter.$or = [
      { title: new RegExp(search, 'i') }, 
      { customerName: new RegExp(search, 'i') }
    ];
  }
  
  const total = await Query.countDocuments(filter);
  const queries = await Query.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
    
  res.json(formatResponse(queries, { 
    total, 
    page: Number(page), 
    limit: Number(limit) 
  }));
});

app.post('/api/queries', requireAdmin, validateQuery, async (req, res) => {
  const newQuery = await Query.create(req.body);
  res.status(201).json(formatResponse(newQuery));
});

app.get('/api/queries/:id', requireAuth, async (req, res) => {
  const query = await Query.findById(req.params.id);
  
  if (!query) {
    return res.status(404).json({ message: 'Query not found' });
  }
  
  res.json(formatResponse(query));
});

app.put('/api/queries/:id', requireAdmin, validateQuery, async (req, res) => {
  const updatedQuery = await Query.findByIdAndUpdate(
    req.params.id, 
    req.body, 
    { new: true, runValidators: true }
  );
  
  if (!updatedQuery) {
    return res.status(404).json({ message: 'Query not found' });
  }
  
  res.json(formatResponse(updatedQuery));
});

app.delete('/api/queries/:id', requireAdmin, async (req, res) => {
  const deletedQuery = await Query.findByIdAndDelete(req.params.id);
  
  if (!deletedQuery) {
    return res.status(404).json({ message: 'Query not found' });
  }
  
  res.json(formatResponse({ message: 'Query successfully deleted' }));
});

export default app;
