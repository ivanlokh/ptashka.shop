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
import { 
  securityHeaders, 
  requestLogger, 
  corsOptions, 
  apiLimiter,
  sanitizeInput,
  requestSizeLimit,
  sqlInjectionProtection 
} from './middleware/security'
import { cache } from './middleware/cache'

const app = express()
const PORT = process.env.API_PORT || 3001

// Initialize Prisma
export const prisma = new PrismaClient()

// Middleware
app.use(securityHeaders)
app.use(requestLogger)
app.use(cors(corsOptions))
app.use(compression())
app.use(morgan('combined'))
app.use(apiLimiter)
app.use(requestSizeLimit)
app.use(sanitizeInput)
app.use(sqlInjectionProtection)
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

// Cart routes (temporary mock)
app.get('/api/cart', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Cart retrieved successfully'
  })
})

app.post('/api/cart', (req, res) => {
  res.json({
    success: true,
    data: { id: '1', productId: req.body.productId, quantity: req.body.quantity },
    message: 'Item added to cart successfully'
  })
})

app.put('/api/cart/:id', (req, res) => {
  res.json({
    success: true,
    data: { id: req.params.id, quantity: req.body.quantity },
    message: 'Cart item updated successfully'
  })
})

app.delete('/api/cart/:id', (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'Cart item removed successfully'
  })
})

app.delete('/api/cart/clear', (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'Cart cleared successfully'
  })
})

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
