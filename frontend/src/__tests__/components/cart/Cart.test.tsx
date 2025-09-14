import { render, screen, fireEvent } from '@testing-library/react';
import Cart from '@/components/cart/Cart';

// Mock CheckoutButton component
jest.mock('@/components/payment/CheckoutButton', () => {
  return function MockCheckoutButton({ items, onSuccess, onError }: any) {
    return (
      <button
        onClick={() => {
          if (items.length === 0) {
            onError('No items in cart');
          } else {
            onSuccess('test-session-id');
          }
        }}
        data-testid="checkout-button"
      >
        Proceed to Checkout
      </button>
    );
  };
});

describe('Cart Component', () => {
  const mockItems = [
    {
      id: '1',
      name: 'Test Product 1',
      price: 29.99,
      quantity: 2,
      images: ['https://example.com/image1.jpg'],
      description: 'Test product description',
    },
    {
      id: '2',
      name: 'Test Product 2',
      price: 49.99,
      quantity: 1,
      images: ['https://example.com/image2.jpg'],
      description: 'Another test product',
    },
  ];

  const mockOnRemoveItem = jest.fn();
  const mockOnUpdateQuantity = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty cart message when no items', () => {
    render(
      <Cart
        items={[]}
        onRemoveItem={mockOnRemoveItem}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Add some items to get started!')).toBeInTheDocument();
  });

  it('renders cart items correctly', () => {
    render(
      <Cart
        items={mockItems}
        onRemoveItem={mockOnRemoveItem}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getAllByText('$49.99')).toHaveLength(2); // Price appears twice in the component
  });

  it('calculates total correctly', () => {
    render(
      <Cart
        items={mockItems}
        onRemoveItem={mockOnRemoveItem}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    // Total should be (29.99 * 2) + (49.99 * 1) = 109.97
    expect(screen.getByText('$109.97')).toBeInTheDocument();
  });

  it('calls onRemoveItem when remove button is clicked', () => {
    render(
      <Cart
        items={mockItems}
        onRemoveItem={mockOnRemoveItem}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);

    expect(mockOnRemoveItem).toHaveBeenCalledWith('1');
  });

  it('calls onUpdateQuantity when quantity buttons are clicked', () => {
    render(
      <Cart
        items={mockItems}
        onRemoveItem={mockOnRemoveItem}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    const incrementButtons = screen.getAllByText('+');
    fireEvent.click(incrementButtons[0]);

    expect(mockOnUpdateQuantity).toHaveBeenCalledWith('1', 3);

    const decrementButtons = screen.getAllByText('-');
    fireEvent.click(decrementButtons[0]);

    expect(mockOnUpdateQuantity).toHaveBeenCalledWith('1', 1);
  });

  it('renders checkout button', () => {
    render(
      <Cart
        items={mockItems}
        onRemoveItem={mockOnRemoveItem}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    expect(screen.getByTestId('checkout-button')).toBeInTheDocument();
  });
});
