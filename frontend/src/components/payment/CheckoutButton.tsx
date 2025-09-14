'use client';

import { useState } from 'react';

interface CheckoutButtonProps {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    images?: string[];
    description?: string;
  }>;
  onSuccess: (sessionId: string) => void;
  onError: (error: string) => void;
}

export default function CheckoutButton({ items, onSuccess, onError }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Checkout failed';
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading || items.length === 0}
      className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
    >
      {isLoading ? 'Processing...' : 'Proceed to Checkout'}
    </button>
  );
}
