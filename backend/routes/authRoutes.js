import express from 'express';
import { adminLogin, register, userLogin } from '../controllers/authController.js';

const router = express.Router();
router.post('/admin/login', adminLogin);
router.post('/register', register);
router.post('/login', userLogin);
export default router;
