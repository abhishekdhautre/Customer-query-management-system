import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

export const adminLogin = (req, res) => {
  const { username, password } = req.body;
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ token: signToken({ username, role: 'admin' }) });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
  if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: signToken({ id: user._id, name: user.name, email: user.email, role: 'user' }) });
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ token: signToken({ id: user._id, name: user.name, email: user.email, role: 'user' }) });
};
