import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Import routes
import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import categoryRoutes from './routes/categories'
import orderRoutes from './routes/orders'
import userRoutes from './routes/users'
import paymentRoutes from './routes/payment'
import placeholderRoutes from './routes/placeholder'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'

const app = express()
const PORT = process.env.API_PORT || 3001

// Initialize Prisma
export const prisma = new PrismaClient()

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(compression())
app.use(morgan('combined'))
app.use(limiter)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/placeholder', placeholderRoutes)

console.log('All routes registered successfully');
console.log('Placeholder routes:', placeholderRoutes);
console.log('Placeholder routes stack:', placeholderRoutes.stack);
console.log('Placeholder routes stack length:', placeholderRoutes.stack?.length);
console.log('Placeholder routes stack details:', placeholderRoutes.stack?.map(r => ({ path: r.route?.path })));

// Test the route directly
app.get('/test-placeholder', (req, res) => {
  res.json({ message: 'Test route works' });
});

// Test placeholder route directly
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  const w = parseInt(width) || 300;
  const h = parseInt(height) || 300;

  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
            font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
        ${w} × ${h}
      </text>
    </svg>
  `;

  res.set({
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=31536000'
  });

  res.send(svg);
});

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`)
})

export default app
