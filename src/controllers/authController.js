
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '24h'
  });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  const userId = await User.create({ name, email, password, phone });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    userId
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  const isValidPassword = await User.verifyPassword(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  const token = generateToken(user.id);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;
  
  const updatedUser = await User.update(req.user.id, { name, email, phone });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser
  });
});

export const addAddress = asyncHandler(async (req, res) => {
  const addressId = await User.addAddress(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Address added successfully',
    addressId
  });
});

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await User.getAddresses(req.user.id);

  res.json({
    success: true,
    addresses
  });
});
