import { PrismaClient, Product, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface CreateProductData {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  trackStock?: boolean;
  weight?: number;
  dimensions?: string;
  isActive?: boolean;
  isDigital?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  categoryId: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductWithDetails extends Product {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    isPrimary: boolean;
  }>;
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    isActive: boolean;
  }>;
  attributes: Array<{
    id: string;
    name: string;
    value: string;
  }>;
  _count: {
    reviews: number;
  };
}

// @desc    Get all products with filters and pagination
export const getProducts = async (filters: ProductFilters = {}) => {
  const {
    search,
    categoryId,
    minPrice,
    maxPrice,
    isActive,
    isFeatured,
    inStock,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20
  } = filters;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { sku: { contains: search } }
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (isFeatured !== undefined) {
    where.isFeatured = isFeatured;
  }

  if (inStock) {
    where.stock = { gt: 0 };
  }

  // Build orderBy clause
  const orderBy: Prisma.ProductOrderByWithRelationInput = {};
  orderBy[sortBy] = sortOrder;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        images: {
          select: {
            id: true,
            url: true,
            alt: true,
            isPrimary: true
          },
          orderBy: { sortOrder: 'asc' }
        },
        variants: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true,
            isActive: true
          }
        },
        attributes: {
          select: {
            id: true,
            name: true,
            value: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    }),
    prisma.product.count({ where })
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// @desc    Get single product by ID
export const getProductById = async (id: string): Promise<ProductWithDetails> => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      images: {
        select: {
          id: true,
          url: true,
          alt: true,
          isPrimary: true
        },
        orderBy: { sortOrder: 'asc' }
      },
      variants: {
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          stock: true,
          isActive: true
        }
      },
      attributes: {
        select: {
          id: true,
          name: true,
          value: true
        }
      },
      _count: {
        select: {
          reviews: true
        }
      }
    }
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product as ProductWithDetails;
};

// @desc    Get product by slug
export const getProductBySlug = async (slug: string): Promise<ProductWithDetails> => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      images: {
        select: {
          id: true,
          url: true,
          alt: true,
          isPrimary: true
        },
        orderBy: { sortOrder: 'asc' }
      },
      variants: {
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          stock: true,
          isActive: true
        }
      },
      attributes: {
        select: {
          id: true,
          name: true,
          value: true
        }
      },
      _count: {
        select: {
          reviews: true
        }
      }
    }
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product as ProductWithDetails;
};

// @desc    Create new product
export const createProduct = async (data: CreateProductData): Promise<Product> => {
  // Check if SKU already exists
  const existingProduct = await prisma.product.findUnique({
    where: { sku: data.sku }
  });

  if (existingProduct) {
    throw new AppError('Product with this SKU already exists', 400);
  }

  // Check if slug already exists
  const existingSlug = await prisma.product.findUnique({
    where: { slug: data.slug }
  });

  if (existingSlug) {
    throw new AppError('Product with this slug already exists', 400);
  }

  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId }
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const product = await prisma.product.create({
    data: {
      ...data,
      trackStock: data.trackStock ?? true,
      isActive: data.isActive ?? true,
      isDigital: data.isDigital ?? false,
      isFeatured: data.isFeatured ?? false,
      sortOrder: data.sortOrder ?? 0
    }
  });

  return product;
};

// @desc    Update product
export const updateProduct = async (id: string, data: UpdateProductData): Promise<Product> => {
  const existingProduct = await prisma.product.findUnique({
    where: { id }
  });

  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }

  // Check if SKU already exists (if being updated)
  if (data.sku && data.sku !== existingProduct.sku) {
    const skuExists = await prisma.product.findUnique({
      where: { sku: data.sku }
    });

    if (skuExists) {
      throw new AppError('Product with this SKU already exists', 400);
    }
  }

  // Check if slug already exists (if being updated)
  if (data.slug && data.slug !== existingProduct.slug) {
    const slugExists = await prisma.product.findUnique({
      where: { slug: data.slug }
    });

    if (slugExists) {
      throw new AppError('Product with this slug already exists', 400);
    }
  }

  // Check if category exists (if being updated)
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data
  });

  return product;
};

// @desc    Delete product
export const deleteProduct = async (id: string): Promise<void> => {
  const existingProduct = await prisma.product.findUnique({
    where: { id }
  });

  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }

  await prisma.product.delete({
    where: { id }
  });
};

// @desc    Get featured products
export const getFeaturedProducts = async (limit: number = 8) => {
  const products = await prisma.product.findMany({
    where: {
      isFeatured: true,
      isActive: true
    },
    take: limit,
    orderBy: { sortOrder: 'asc' },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      images: {
        select: {
          id: true,
          url: true,
          alt: true,
          isPrimary: true
        },
        orderBy: { sortOrder: 'asc' }
      },
      _count: {
        select: {
          reviews: true
        }
      }
    }
  });

  return products;
};

// @desc    Get products by category
export const getProductsByCategory = async (categoryId: string, limit: number = 20) => {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      isActive: true
    },
    take: limit,
    orderBy: { sortOrder: 'asc' },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      images: {
        select: {
          id: true,
          url: true,
          alt: true,
          isPrimary: true
        },
        orderBy: { sortOrder: 'asc' }
      },
      _count: {
        select: {
          reviews: true
        }
      }
    }
  });

  return products;
};
