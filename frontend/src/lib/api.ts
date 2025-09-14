import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh',
  },
  
  // Products
  products: {
    list: '/products',
    featured: '/products/featured',
    byCategory: (categoryId: string) => `/products/category/${categoryId}`,
    byId: (id: string) => `/products/${id}`,
    create: '/products',
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
  },
  
  // Categories
  categories: {
    list: '/categories',
    byId: (id: string) => `/categories/${id}`,
    create: '/categories',
    update: (id: string) => `/categories/${id}`,
    delete: (id: string) => `/categories/${id}`,
  },
  
  // Cart
  cart: {
    list: '/cart',
    add: '/cart',
    update: (id: string) => `/cart/${id}`,
    delete: (id: string) => `/cart/${id}`,
    clear: '/cart/clear',
  },
  
  // Orders
  orders: {
    list: '/orders',
    create: '/orders',
    byId: (id: string) => `/orders/${id}`,
    update: (id: string) => `/orders/${id}`,
  },
  
  // Payment
  payment: {
    create: '/payment/create',
    confirm: '/payment/confirm',
  },
} as const;

// API functions
export const apiClient = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await api.post(endpoints.auth.login, { email, password });
    return response.data;
  },
  
  register: async (userData: { email: string; password: string; firstName?: string; lastName?: string }) => {
    const response = await api.post(endpoints.auth.register, userData);
    return response.data;
  },
  
  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post(endpoints.auth.logout, { refreshToken });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get(endpoints.auth.me);
    return response.data;
  },
  
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post(endpoints.auth.refresh, { refreshToken });
    return response.data;
  },
  
  // Products
  getProducts: async (params?: {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get(endpoints.products.list, { params });
    return response.data;
  },
  
  getFeaturedProducts: async (limit = 8) => {
    const response = await api.get(endpoints.products.featured, { params: { limit } });
    return response.data;
  },
  
  getProductById: async (id: string) => {
    const response = await api.get(endpoints.products.byId(id));
    return response.data;
  },
  
  getProductsByCategory: async (categoryId: string, limit = 20) => {
    const response = await api.get(endpoints.products.byCategory(categoryId), { params: { limit } });
    return response.data;
  },
  
  createProduct: async (productData: any) => {
    const response = await api.post(endpoints.products.create, productData);
    return response.data;
  },
  
  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(endpoints.products.update(id), productData);
    return response.data;
  },
  
  deleteProduct: async (id: string) => {
    const response = await api.delete(endpoints.products.delete(id));
    return response.data;
  },
  
  // Categories
  getCategories: async () => {
    const response = await api.get(endpoints.categories.list);
    return response.data;
  },
  
  getCategoryById: async (id: string) => {
    const response = await api.get(endpoints.categories.byId(id));
    return response.data;
  },
  
  createCategory: async (categoryData: any) => {
    const response = await api.post(endpoints.categories.create, categoryData);
    return response.data;
  },
  
  updateCategory: async (id: string, categoryData: any) => {
    const response = await api.put(endpoints.categories.update(id), categoryData);
    return response.data;
  },
  
  deleteCategory: async (id: string) => {
    const response = await api.delete(endpoints.categories.delete(id));
    return response.data;
  },
  
  // Cart
  getCartItems: async () => {
    const response = await api.get(endpoints.cart.list);
    return response.data;
  },
  
  addToCart: async (productId: string, quantity = 1) => {
    const response = await api.post(endpoints.cart.add, { productId, quantity });
    return response.data;
  },
  
  updateCartItem: async (id: string, quantity: number) => {
    const response = await api.put(endpoints.cart.update(id), { quantity });
    return response.data;
  },
  
  removeFromCart: async (id: string) => {
    const response = await api.delete(endpoints.cart.delete(id));
    return response.data;
  },
  
  clearCart: async () => {
    const response = await api.delete(endpoints.cart.clear);
    return response.data;
  },
  
  // Orders
  getOrders: async () => {
    const response = await api.get(endpoints.orders.list);
    return response.data;
  },
  
  createOrder: async (orderData: any) => {
    const response = await api.post(endpoints.orders.create, orderData);
    return response.data;
  },
  
  getOrderById: async (id: string) => {
    const response = await api.get(endpoints.orders.byId(id));
    return response.data;
  },
  
  updateOrder: async (id: string, orderData: any) => {
    const response = await api.put(endpoints.orders.update(id), orderData);
    return response.data;
  },
  
  // Payment
  createPayment: async (paymentData: any) => {
    const response = await api.post(endpoints.payment.create, paymentData);
    return response.data;
  },
  
  confirmPayment: async (paymentData: any) => {
    const response = await api.post(endpoints.payment.confirm, paymentData);
    return response.data;
  },
};

export default apiClient;
