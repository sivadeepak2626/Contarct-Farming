import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore } from '../data/dataStore.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'farmcontract-dev-secret-key-change-in-production-2026';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    name: string;
    role: 'admin' | 'farmer' | 'buyer' | 'officer';
    associatedId?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. Authentication token missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = dbStore.users.find((u) => u.email.toLowerCase() === decoded.email?.toLowerCase());

    if (!user || (user.status as string) === 'inactive') {
      return res.status(401).json({ success: false, message: 'Invalid or inactive user account.' });
    }

    req.user = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      associatedId: user.associatedId,
    };
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token is invalid or has expired.' });
  }
};

export const authorizeRoles = (...roles: Array<'admin' | 'farmer' | 'buyer' | 'officer'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized request.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};
