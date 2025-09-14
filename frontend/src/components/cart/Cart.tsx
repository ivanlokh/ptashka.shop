'use client';

import { useState } from 'react';
import CheckoutButton from '@/components/payment/CheckoutButton';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images?: string[];
  description?: string;
}

interface CartProps {
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export default function Cart({ items, onRemoveItem, onUpdateQuantity }: CartProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckoutSuccess = (sessionId: string) => {
    console.log('Checkout successful:', sessionId);
    setIsCheckingOut(false);
    // Redirect to success page or show success message
  };

  const handleCheckoutError = (error: string) => {
    setCheckoutError(error);
    setIsCheckingOut(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
          <p className="text-gray-500">Add some items to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.id} className="p-6 flex items-center space-x-4">
              {item.images && item.images.length > 0 && (
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
              )}
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                {item.description && (
                  <p className="text-gray-600 text-sm">{item.description}</p>
                )}
                <p className="text-lg font-semibold text-blue-600">
                  ${item.price.toFixed(2)}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                >
                  +
                </button>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-semibold">Total:</span>
            <span className="text-2xl font-bold text-blue-600">
              ${total.toFixed(2)}
            </span>
          </div>
          
          {checkoutError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {checkoutError}
            </div>
          )}
          
          <CheckoutButton
            items={items}
            onSuccess={handleCheckoutSuccess}
            onError={handleCheckoutError}
          />
        </div>
      </div>
    </div>
  );
}
