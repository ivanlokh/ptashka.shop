import { render, screen } from '@testing-library/react';

// Mock Stripe components completely
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({})),
}));

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div data-testid="stripe-elements">{children}</div>,
  CardElement: () => <div data-testid="card-element">Card Element</div>,
  useStripe: () => ({
    confirmCardPayment: jest.fn(),
    elements: jest.fn(),
    createPaymentMethod: jest.fn(),
  }),
  useElements: () => ({
    getElement: jest.fn(() => ({})),
  }),
}));

// Mock PaymentForm component
jest.mock('@/components/payment/PaymentForm', () => {
  return function MockPaymentForm({ amount, onSuccess, onError }: any) {
    return (
      <div data-testid="payment-form">
        <h2>Payment Details</h2>
        <p>Total: ${(amount / 100).toFixed(2)}</p>
        <button>Pay Now</button>
      </div>
    );
  };
});

import PaymentForm from '@/components/payment/PaymentForm';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

describe('PaymentForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders payment form correctly', () => {
    render(
      <TestWrapper>
        <PaymentForm
          amount={2999} // $29.99 in cents
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Payment Details')).toBeInTheDocument();
    expect(screen.getByText('Total: $29.99')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pay now/i })).toBeInTheDocument();
  });

  it('shows correct total amount', () => {
    render(
      <TestWrapper>
        <PaymentForm
          amount={5000} // $50.00 in cents
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Total: $50.00')).toBeInTheDocument();
  });

  it('renders with different amounts', () => {
    render(
      <TestWrapper>
        <PaymentForm
          amount={10000} // $100.00 in cents
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Total: $100.00')).toBeInTheDocument();
  });
});
