import axios from 'axios';
import { apiClient } from '@/lib/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Auth endpoints', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: '1', email: 'test@example.com', role: 'CUSTOMER' },
            token: 'mock-token',
            refreshToken: 'mock-refresh-token',
          },
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await apiClient.login('test@example.com', 'password');

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should register successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: '1', email: 'test@example.com', role: 'CUSTOMER' },
            token: 'mock-token',
            refreshToken: 'mock-refresh-token',
          },
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const userData = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
      };

      const result = await apiClient.register(userData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should get current user', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: '1', email: 'test@example.com', role: 'CUSTOMER' },
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);
      localStorageMock.getItem.mockReturnValue('mock-token');

      const result = await apiClient.getMe();

      expect(mockedAxios.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse.data);
    });

    it('should logout successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: null,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);
      localStorageMock.getItem.mockReturnValue('mock-refresh-token');

      const result = await apiClient.logout();

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/logout', {
        refreshToken: 'mock-refresh-token',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Products endpoints', () => {
    it('should get products with filters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            products: [
              {
                id: '1',
                name: 'Test Product',
                price: 100,
                stock: 10,
              },
            ],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              pages: 1,
            },
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const params = {
        search: 'test',
        categoryId: 'electronics',
        minPrice: 50,
        maxPrice: 200,
        sortBy: 'price',
        sortOrder: 'asc' as const,
      };

      const result = await apiClient.getProducts(params);

      expect(mockedAxios.get).toHaveBeenCalledWith('/products', { params });
      expect(result).toEqual(mockResponse.data);
    });

    it('should get featured products', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            {
              id: '1',
              name: 'Featured Product',
              price: 100,
              isFeatured: true,
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getFeaturedProducts(8);

      expect(mockedAxios.get).toHaveBeenCalledWith('/products/featured', {
        params: { limit: 8 },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should get product by id', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: '1',
            name: 'Test Product',
            price: 100,
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getProductById('1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/products/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Cart endpoints', () => {
    it('should add to cart', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: '1',
            productId: 'product-1',
            quantity: 1,
          },
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await apiClient.addToCart('product-1', 2);

      expect(mockedAxios.post).toHaveBeenCalledWith('/cart', {
        productId: 'product-1',
        quantity: 2,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should get cart items', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            {
              id: '1',
              productId: 'product-1',
              quantity: 1,
              product: {
                id: 'product-1',
                name: 'Test Product',
                price: 100,
                images: [],
              },
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getCartItems();

      expect(mockedAxios.get).toHaveBeenCalledWith('/cart');
      expect(result).toEqual(mockResponse.data);
    });

    it('should update cart item', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: '1',
            quantity: 3,
          },
        },
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await apiClient.updateCartItem('1', 3);

      expect(mockedAxios.put).toHaveBeenCalledWith('/cart/1', { quantity: 3 });
      expect(result).toEqual(mockResponse.data);
    });

    it('should remove from cart', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: null,
        },
      };

      mockedAxios.delete.mockResolvedValue(mockResponse);

      const result = await apiClient.removeFromCart('1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/cart/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('should clear cart', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: null,
        },
      };

      mockedAxios.delete.mockResolvedValue(mockResponse);

      const result = await apiClient.clearCart();

      expect(mockedAxios.delete).toHaveBeenCalledWith('/cart/clear');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Categories endpoints', () => {
    it('should get categories', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            {
              id: '1',
              name: 'Electronics',
              slug: 'electronics',
              isActive: true,
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getCategories();

      expect(mockedAxios.get).toHaveBeenCalledWith('/categories');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Error handling', () => {
    it('should handle 401 errors by redirecting to login', async () => {
      const error = {
        response: {
          status: 401,
        },
      };

      mockedAxios.get.mockRejectedValue(error);

      // Mock window.location
      delete (window as any).location;
      window.location = { href: '' } as any;

      await apiClient.getMe();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });
});
