import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from './errorHandler';

const prisma = new PrismaClient();

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// @desc    Verify JWT token and protect routes
// @access  Private
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      if (!user) {
        return next(new AppError('Token is valid but user no longer exists.', 401));
      }

      if (!user.isActive) {
        return next(new AppError('User account has been deactivated.', 401));
      }

      // Grant access to protected route
      req.user = user;
      next();
    } catch (error) {
      return next(new AppError('Invalid token.', 401));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Grant access to specific roles
// @access  Private
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Access denied. User not authenticated.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Access denied. Role ${req.user.role} is not authorized to access this route.`, 403));
    }

    next();
  };
};
