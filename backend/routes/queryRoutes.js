import express from 'express';
import { getQueries, getQueryById, createQuery, updateQuery, deleteQuery, getMyQueries, getQueryStats } from '../controllers/queryController.js';
import { validateQuery } from '../middleware/validationMiddleware.js';
import { requireAdmin, requireUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/submit', validateQuery, createQuery);
router.get('/my', requireUser, getMyQueries);
router.get('/stats', requireAdmin, getQueryStats);

router.route('/')
  .get(requireAdmin, getQueries)
  .post(requireAdmin, validateQuery, createQuery);

router.route('/:id')
  .get(requireUser, getQueryById)
  .put(requireAdmin, validateQuery, updateQuery)
  .delete(requireAdmin, deleteQuery);

export default router;

