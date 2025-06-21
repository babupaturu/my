
import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  addAddress,
  getAddresses
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, registerSchema, loginSchema } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/addresses', authenticateToken, addAddress);
router.get('/addresses', authenticateToken, getAddresses);

export default router;
