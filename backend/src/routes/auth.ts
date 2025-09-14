import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { asyncHandler, AppError } from '../middleware/errorHandler'
import { protect } from '../middleware/auth'
import { hashPassword, comparePassword } from '../utils/password'
import { generateToken, generateRefreshToken } from '../utils/jwt'
import { validateRegistration, validateLogin } from '../utils/validation'

const router = Router()
const prisma = new PrismaClient()

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateRegistration, asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new AppError('User with this email already exists', 400)
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: firstName || null,
      lastName: lastName || null,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    }
  })

  // Generate tokens
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  })

  const refreshToken = generateRefreshToken({
    id: user.id,
    email: user.email,
    role: user.role
  })

  // Remove old refresh tokens for this user
  await prisma.refreshToken.deleteMany({
    where: { userId: user.id }
  })

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  })

  res.status(201).json({
    success: true,
    data: {
      user,
      token,
      refreshToken
    },
    message: 'User registered successfully'
  })
}))

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateLogin, asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || !(await comparePassword(password, user.password))) {
    throw new AppError('Invalid email or password', 401)
  }

  if (!user.isActive) {
    throw new AppError('Account has been deactivated', 401)
  }

  // Generate tokens
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  })

  const refreshToken = generateRefreshToken({
    id: user.id,
    email: user.email,
    role: user.role
  })

  // Remove old refresh tokens for this user
  await prisma.refreshToken.deleteMany({
    where: { userId: user.id }
  })

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  })

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      token,
      refreshToken
    },
    message: 'Login successful'
  })
}))

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body

  if (refreshToken) {
    // Remove refresh token from database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    })
  }

  res.json({
    success: true,
    data: null,
    message: 'Logout successful'
  })
}))

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    }
  })

  if (!user) {
    throw new AppError('User not found', 404)
  }

  res.json({
    success: true,
    data: { user },
    message: 'User data retrieved successfully'
  })
}))

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400)
  }

  // Verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { id: string }

  // Check if refresh token exists in database
  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      token: refreshToken,
      userId: decoded.id,
      expiresAt: {
        gt: new Date()
      }
    }
  })

  if (!storedToken) {
    throw new AppError('Invalid or expired refresh token', 401)
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    }
  })

  if (!user || !user.isActive) {
    throw new AppError('User not found or inactive', 401)
  }

  // Generate new tokens
  const newToken = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  })

  const newRefreshToken = generateRefreshToken({
    id: user.id,
    email: user.email,
    role: user.role
  })

  // Update refresh token in database
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: {
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  })

  res.json({
    success: true,
    data: {
      token: newToken,
      refreshToken: newRefreshToken
    },
    message: 'Token refreshed successfully'
  })
}))

export default router
