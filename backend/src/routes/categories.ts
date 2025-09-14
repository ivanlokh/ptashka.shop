import { Router, Request, Response } from 'express'
import { asyncHandler } from '../middleware/errorHandler'
import { protect, authorize } from '../middleware/auth'
import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree
} from '../services/categoryService'

const router = Router()

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const includeInactive = req.query.includeInactive === 'true'
  const categories = await getCategories(includeInactive)

  res.json({
    success: true,
    data: categories,
    message: 'Categories retrieved successfully'
  })
}))

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
router.get('/tree', asyncHandler(async (req: Request, res: Response) => {
  const tree = await getCategoryTree()

  res.json({
    success: true,
    data: tree,
    message: 'Category tree retrieved successfully'
  })
}))

// @desc    Get single category by ID or slug
// @route   GET /api/categories/:identifier
// @access  Public
router.get('/:identifier', asyncHandler(async (req: Request, res: Response) => {
  const { identifier } = req.params
  
  // Check if identifier is a valid UUID (ID) or slug
  const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier) || 
               /^[a-z0-9]{25}$/i.test(identifier) // CUID format
  
  let category
  if (isId) {
    category = await getCategoryById(identifier)
  } else {
    category = await getCategoryBySlug(identifier)
  }

  res.json({
    success: true,
    data: category,
    message: 'Category retrieved successfully'
  })
}))

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
router.post('/', protect, authorize('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
  const category = await createCategory(req.body)

  res.status(201).json({
    success: true,
    data: category,
    message: 'Category created successfully'
  })
}))

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const category = await updateCategory(id, req.body)

  res.json({
    success: true,
    data: category,
    message: 'Category updated successfully'
  })
}))

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('ADMIN'), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  await deleteCategory(id)

  res.json({
    success: true,
    data: null,
    message: 'Category deleted successfully'
  })
}))

export default router
