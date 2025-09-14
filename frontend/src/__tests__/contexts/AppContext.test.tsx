import { render, screen, act, waitFor } from '@testing-library/react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { apiClient } from '@/lib/api';

// Mock the API client
jest.mock('@/lib/api', () => ({
  apiClient: {
    getMe: jest.fn(),
    getCartItems: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    addToCart: jest.fn(),
    updateCartItem: jest.fn(),
    removeFromCart: jest.fn(),
    clearCart: jest.fn(),
  },
}));

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

// Test component that uses the context
const TestComponent = () => {
  const { state, actions } = useApp();
  
  return (
    <div>
      <div data-testid="user-email">{state.user?.email || 'No user'}</div>
      <div data-testid="cart-count">{state.cartCount}</div>
      <div data-testid="is-authenticated">{state.isAuthenticated.toString()}</div>
      <button 
        onClick={() => actions.login('test@example.com', 'password')}
        data-testid="login-btn"
      >
        Login
      </button>
      <button 
        onClick={() => actions.addToCart('product-1', 1)}
        data-testid="add-to-cart-btn"
      >
        Add to Cart
      </button>
    </div>
  );
};

describe('AppContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should provide initial state', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
  });

  it('should handle login', async () => {
    const mockResponse = {
      success: true,
      data: {
        user: { id: '1', email: 'test@example.com', role: 'CUSTOMER' },
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
      },
    };

    (apiClient.login as jest.Mock).mockResolvedValue(mockResponse);

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token');
  });

  it('should handle add to cart', async () => {
    const mockResponse = {
      success: true,
      data: [],
    };

    (apiClient.addToCart as jest.Mock).mockResolvedValue(mockResponse);
    (apiClient.getCartItems as jest.Mock).mockResolvedValue({
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
    });

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await act(async () => {
      screen.getByTestId('add-to-cart-btn').click();
    });

    await waitFor(() => {
      expect(apiClient.addToCart).toHaveBeenCalledWith('product-1', 1);
    });
  });

  it('should load user on mount if token exists', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'mock-token';
      return null;
    });

    const mockResponse = {
      success: true,
      data: {
        user: { id: '1', email: 'test@example.com', role: 'CUSTOMER' },
      },
    };

    (apiClient.getMe as jest.Mock).mockResolvedValue(mockResponse);

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });
  });

  it('should handle logout', async () => {
    const mockResponse = {
      success: true,
      data: null,
    };

    (apiClient.logout as jest.Mock).mockResolvedValue(mockResponse);

    // Start with authenticated user
    const mockUser = { id: '1', email: 'test@example.com', role: 'CUSTOMER' };
    
    const TestComponentWithLogout = () => {
      const { state, actions } = useApp();
      
      return (
        <div>
          <div data-testid="user-email">{state.user?.email || 'No user'}</div>
          <div data-testid="is-authenticated">{state.isAuthenticated.toString()}</div>
          <button 
            onClick={() => actions.logout()}
            data-testid="logout-btn"
          >
            Logout
          </button>
        </div>
      );
    };

    render(
      <AppProvider>
        <TestComponentWithLogout />
      </AppProvider>
    );

    // Set initial state
    act(() => {
      // Simulate authenticated state
      localStorageMock.getItem.mockReturnValue('mock-token');
    });

    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
  });
});
