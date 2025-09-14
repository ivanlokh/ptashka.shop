import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';

// @desc    Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// @desc    Validate password strength
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' };
  }

  return { isValid: true };
};

// @desc    Validate registration data
export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName } = req.body;

  // Check required fields
  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  // Validate email
  if (!validateEmail(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return next(new AppError(passwordValidation.message!, 400));
  }

  // Validate optional fields
  if (firstName && firstName.length > 50) {
    return next(new AppError('First name must be less than 50 characters', 400));
  }

  if (lastName && lastName.length > 50) {
    return next(new AppError('Last name must be less than 50 characters', 400));
  }

  next();
};

// @desc    Validate login data
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  if (!validateEmail(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  next();
};
