import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore } from '../data/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'farmcontract-dev-secret-key-change-in-production-2026';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
  }

  const user = dbStore.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const isMatch = bcryptjs.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (user.status === 'inactive') {
    return res.status(403).json({ success: false, message: 'Your account is deactivated. Contact administrator.' });
  }

  const token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      associatedId: user.associatedId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: 'Login successful.',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      associatedId: user.associatedId,
    },
  });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const user = dbStore.users.find((u) => u.email.toLowerCase() === req.user!.email.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  return res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      associatedId: user.associatedId,
    },
  });
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, phone, associatedId } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
  }

  const existing = dbStore.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
  }

  const newUser = {
    _id: `usr-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: bcryptjs.hashSync(password, 8),
    role: role,
    phone: phone || '',
    associatedId: associatedId || '',
    status: 'active' as const,
  };

  dbStore.users.push(newUser);

  return res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
};

export const getDemoAccounts = async (_req: Request, res: Response) => {
  return res.json({
    success: true,
    accounts: [
      { role: 'admin', label: 'Platform Administrator', email: 'admin@farmcontract.in', password: 'Admin@123' },
      { role: 'farmer', label: 'Farmer (Ramesh Patel)', email: 'farmer@farmcontract.in', password: 'Farmer@123' },
      { role: 'buyer', label: 'AgroCorp Buyer (Vikram Malhotra)', email: 'buyer@farmcontract.in', password: 'Buyer@123' },
      { role: 'officer', label: 'Field Officer (Dr. Priya Rao)', email: 'officer@farmcontract.in', password: 'Officer@123' },
    ],
  });
};
