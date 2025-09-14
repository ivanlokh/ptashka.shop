import { Router, Request, Response } from 'express'
import { asyncHandler } from '../middleware/errorHandler'
import { protect, authorize } from '../middleware/auth'
import { cache, invalidateCacheByTags } from '../middleware/cache'
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory
} from '../services/productService'

const router = Router()

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', cache({ ttl: 300 }), asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    search: req.query.search as string,
    categoryId: req.query.categoryId as string,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
    isFeatured: req.query.isFeatured ? req.query.isFeatured === 'true' : undefined,
    inStock: req.query.inStock ? req.query.inStock === 'true' : undefined,
    sortBy: req.query.sortBy as 'name' | 'price' | 'createdAt' | 'updatedAt',
    sortOrder: req.query.sortOrder as 'asc' | 'desc',
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 20
  }

  const result = await getProducts(filters)

  res.json({
    success: true,
    data: result,
    message: 'Products retrieved successfully'
  })
}))

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', cache({ ttl: 600 }), asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 8
  const products = await getFeaturedProducts(limit)

  res.json({
    success: true,
    data: products,
    message: 'Featured products retrieved successfully'
  })
}))

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
router.get('/category/:categoryId', asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params
  const limit = req.query.limit ? Number(req.query.limit) : 20
  const products = await getProductsByCategory(categoryId, limit)

  res.json({
    success: true,
    data: products,
    message: 'Products by category retrieved successfully'
  })
}))

// @desc    Get single product by ID or slug
// @route   GET /api/products/:identifier
// @access  Public
router.get('/:identifier', asyncHandler(async (req: Request, res: Response) => {
  const { identifier } = req.params
  
  // Check if identifier is a valid UUID (ID) or slug
  const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier) || 
               /^[a-z0-9]{25}$/i.test(identifier) // CUID format
  
  let product
  if (isId) {
    product = await getProductById(identifier)
  } else {
    product = await getProductBySlug(identifier)
  }

  res.json({
    success: true,
    data: product,
    message: 'Product retrieved successfully'
  })
}))

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, authorize('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
  const product = await createProduct(req.body)
  
  // Invalidate product cache
  await invalidateCacheByTags(['products', 'featured'])

  res.status(201).json({
    success: true,
    data: product,
    message: 'Product created successfully'
  })
}))

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const product = await updateProduct(id, req.body)

  res.json({
    success: true,
    data: product,
    message: 'Product updated successfully'
  })
}))

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  await deleteProduct(id)

  res.json({
    success: true,
    data: null,
    message: 'Product deleted successfully'
  })
}))

export default router
