import { PrismaClient, Category, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export interface CategoryWithDetails extends Category {
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  children: Array<{
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    sortOrder: number;
  }>;
  _count: {
    products: number;
  };
}

// @desc    Get all categories
export const getCategories = async (includeInactive: boolean = false) => {
  const categories = await prisma.category.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          sortOrder: true
        },
        orderBy: { sortOrder: 'asc' }
      },
      _count: {
        select: {
          products: true
        }
      }
    }
  });

  return categories;
};

// @desc    Get single category by ID
export const getCategoryById = async (id: string): Promise<CategoryWithDetails> => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          sortOrder: true
        },
        orderBy: { sortOrder: 'asc' }
      },
      _count: {
        select: {
          products: true
        }
      }
    }
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return category as CategoryWithDetails;
};

// @desc    Get category by slug
export const getCategoryBySlug = async (slug: string): Promise<CategoryWithDetails> => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          sortOrder: true
        },
        orderBy: { sortOrder: 'asc' }
      },
      _count: {
        select: {
          products: true
        }
      }
    }
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return category as CategoryWithDetails;
};

// @desc    Create new category
export const createCategory = async (data: CreateCategoryData): Promise<Category> => {
  // Check if slug already exists
  const existingSlug = await prisma.category.findUnique({
    where: { slug: data.slug }
  });

  if (existingSlug) {
    throw new AppError('Category with this slug already exists', 400);
  }

  // Check if parent category exists (if provided)
  if (data.parentId) {
    const parentCategory = await prisma.category.findUnique({
      where: { id: data.parentId }
    });

    if (!parentCategory) {
      throw new AppError('Parent category not found', 404);
    }
  }

  const category = await prisma.category.create({
    data: {
      ...data,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0
    }
  });

  return category;
};

// @desc    Update category
export const updateCategory = async (id: string, data: UpdateCategoryData): Promise<Category> => {
  const existingCategory = await prisma.category.findUnique({
    where: { id }
  });

  if (!existingCategory) {
    throw new AppError('Category not found', 404);
  }

  // Check if slug already exists (if being updated)
  if (data.slug && data.slug !== existingCategory.slug) {
    const slugExists = await prisma.category.findUnique({
      where: { slug: data.slug }
    });

    if (slugExists) {
      throw new AppError('Category with this slug already exists', 400);
    }
  }

  // Check if parent category exists (if being updated)
  if (data.parentId) {
    const parentCategory = await prisma.category.findUnique({
      where: { id: data.parentId }
    });

    if (!parentCategory) {
      throw new AppError('Parent category not found', 404);
    }

    // Prevent setting parent to self
    if (data.parentId === id) {
      throw new AppError('Category cannot be its own parent', 400);
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data
  });

  return category;
};

// @desc    Delete category
export const deleteCategory = async (id: string): Promise<void> => {
  const existingCategory = await prisma.category.findUnique({
    where: { id }
  });

  if (!existingCategory) {
    throw new AppError('Category not found', 404);
  }

  // Check if category has children
  const childrenCount = await prisma.category.count({
    where: { parentId: id }
  });

  if (childrenCount > 0) {
    throw new AppError('Cannot delete category with children. Please delete children first.', 400);
  }

  // Check if category has products
  const productsCount = await prisma.product.count({
    where: { categoryId: id }
  });

  if (productsCount > 0) {
    throw new AppError('Cannot delete category with products. Please move or delete products first.', 400);
  }

  await prisma.category.delete({
    where: { id }
  });
};

// @desc    Get category tree (hierarchical structure)
export const getCategoryTree = async () => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
          },
          _count: {
            select: {
              products: true
            }
          }
        }
      },
      _count: {
        select: {
          products: true
        }
      }
    }
  });

  // Filter to only root categories (no parent)
  const rootCategories = categories.filter(category => !category.parentId);

  return rootCategories;
};
