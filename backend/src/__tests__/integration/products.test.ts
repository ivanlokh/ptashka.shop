import request from 'supertest';
import app from '../../index';

// Mock Prisma methods
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    product: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
    $disconnect: jest.fn(),
  })),
}));

// Get the mocked Prisma instance
const { PrismaClient } = require('@prisma/client');
const mockPrisma = new PrismaClient();

describe('Products Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product 1',
          description: 'Test description 1',
          price: 29.99,
          stock: 10,
          categoryId: 'cat1',
          images: ['image1.jpg'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Test Product 2',
          description: 'Test description 2',
          price: 49.99,
          stock: 5,
          categoryId: 'cat2',
          images: ['image2.jpg'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(2);
      expect(response.body.products[0].name).toBe('Test Product 1');
    });

    it('should filter products by category', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product 1',
          description: 'Test description 1',
          price: 29.99,
          stock: 10,
          categoryId: 'cat1',
          images: ['image1.jpg'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/api/products?category=cat1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(1);
    });

    it('should search products by name', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product 1',
          description: 'Test description 1',
          price: 29.99,
          stock: 10,
          categoryId: 'cat1',
          images: ['image1.jpg'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/api/products?search=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(1);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product 1',
        description: 'Test description 1',
        price: 29.99,
        stock: 10,
        categoryId: 'cat1',
        images: ['image1.jpg'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      const response = await request(app)
        .get('/api/products/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.product.name).toBe('Test Product 1');
    });

    it('should return 404 for non-existent product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/products/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
