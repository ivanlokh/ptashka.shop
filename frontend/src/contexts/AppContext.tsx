'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';

// Types
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: Array<{
      id: string;
      url: string;
      alt?: string;
      isPrimary: boolean;
    }>;
  };
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  cart: CartItem[];
  cartCount: number;
  searchQuery: string;
  selectedCategory: string | null;
}

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'UPDATE_CART_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string | null }
  | { type: 'LOGOUT' };

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  cart: [],
  cartCount: 0,
  searchQuery: '',
  selectedCategory: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    
    case 'SET_CART':
      return {
        ...state,
        cart: action.payload,
        cartCount: action.payload.reduce((sum, item) => sum + item.quantity, 0),
      };
    
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.productId === action.payload.productId);
      if (existingItem) {
        const updatedCart = state.cart.map(item =>
          item.productId === action.payload.productId
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        return {
          ...state,
          cart: updatedCart,
          cartCount: updatedCart.reduce((sum, item) => sum + item.quantity, 0),
        };
      } else {
        const newCart = [...state.cart, action.payload];
        return {
          ...state,
          cart: newCart,
          cartCount: newCart.reduce((sum, item) => sum + item.quantity, 0),
        };
      }
    
    case 'UPDATE_CART_ITEM':
      const updatedCart = state.cart.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        cart: updatedCart,
        cartCount: updatedCart.reduce((sum, item) => sum + item.quantity, 0),
      };
    
    case 'REMOVE_FROM_CART':
      const filteredCart = state.cart.filter(item => item.id !== action.payload);
      return {
        ...state,
        cart: filteredCart,
        cartCount: filteredCart.reduce((sum, item) => sum + item.quantity, 0),
      };
    
    case 'CLEAR_CART':
      return { ...state, cart: [], cartCount: 0 };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (userData: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
    loadUser: () => Promise<void>;
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    updateCartItem: (id: string, quantity: number) => Promise<void>;
    removeFromCart: (id: string) => Promise<void>;
    clearCart: () => Promise<void>;
    loadCart: () => Promise<void>;
    setSearchQuery: (query: string) => void;
    setSelectedCategory: (categoryId: string | null) => void;
  };
} | null>(null);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load user on mount
  useEffect(() => {
    loadUser();
    loadCart();
  }, []);

  // Actions
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiClient.login(email, password);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        dispatch({ type: 'SET_USER', payload: response.data.user });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const register = async (userData: { email: string; password: string; firstName?: string; lastName?: string }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiClient.register(userData);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        dispatch({ type: 'SET_USER', payload: response.data.user });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const response = await apiClient.getMe();
      if (response.success) {
        dispatch({ type: 'SET_USER', payload: response.data.user });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      }
    } catch (error) {
      console.error('Load user error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = async (productId: string, quantity = 1) => {
    try {
      const response = await apiClient.addToCart(productId, quantity);
      if (response.success) {
        await loadCart();
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  };

  const updateCartItem = async (id: string, quantity: number) => {
    try {
      const response = await apiClient.updateCartItem(id, quantity);
      if (response.success) {
        await loadCart();
      }
    } catch (error) {
      console.error('Update cart item error:', error);
      throw error;
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      const response = await apiClient.removeFromCart(id);
      if (response.success) {
        await loadCart();
      }
    } catch (error) {
      console.error('Remove from cart error:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const response = await apiClient.clearCart();
      if (response.success) {
        dispatch({ type: 'CLEAR_CART' });
      }
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  };

  const loadCart = async () => {
    try {
      const response = await apiClient.getCartItems();
      if (response.success) {
        dispatch({ type: 'SET_CART', payload: response.data });
      }
    } catch (error) {
      console.error('Load cart error:', error);
      // Don't throw error for cart loading
    }
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setSelectedCategory = (categoryId: string | null) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: categoryId });
  };

  const actions = {
    login,
    logout,
    register,
    loadUser,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    setSearchQuery,
    setSelectedCategory,
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
