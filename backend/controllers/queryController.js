import Query from '../models/Query.js';
import { successResponse } from '../utils/apiResponse.js';

export const getQueries = async (req, res) => {
  const { status, priority, search, page = 1, limit = 10 } = req.query;
  const filter = { isDeleted: { $ne: true } };
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

  res.json(successResponse(queries, { total, page: Number(page), limit: Number(limit) }));
};

export const getQueryStats = async (req, res) => {
  const stats = await Query.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const counts = { open: 0, 'in-progress': 0, resolved: 0, closed: 0 };
  stats.forEach((item) => {
    if (counts[item._id] !== undefined) {
      counts[item._id] = item.count;
    }
  });

  res.json(successResponse(counts));
};

export const getQueryById = async (req, res) => {
  const query = await Query.findById(req.params.id);
  if (!query || query.isDeleted) return res.status(404).json({ message: 'Query not found' });
  
  if (req.user.role !== 'admin' && query.customerEmail !== req.user.email) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  res.json(successResponse(query));
};

export const createQuery = async (req, res) => {
  const query = await Query.create(req.body);
  res.status(201).json(successResponse(query));
};

export const updateQuery = async (req, res) => {
  const query = await Query.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!query || query.isDeleted) return res.status(404).json({ message: 'Query not found' });
  res.json(successResponse(query));
};

export const getMyQueries = async (req, res) => {
  const queries = await Query.find({ customerEmail: req.user.email, isDeleted: { $ne: true } }).sort({ createdAt: -1 });
  res.json(successResponse(queries));
};

export const deleteQuery = async (req, res) => {
  const query = await Query.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
  if (!query) return res.status(404).json({ message: 'Query not found' });
  res.json(successResponse({ message: 'Query deleted successfully' }));
};

