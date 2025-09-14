'use client';

import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import Link from 'next/link';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { state, actions } = useApp();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await actions.removeFromCart(id);
      return;
    }

    try {
      setUpdating(id);
      await actions.updateCartItem(id, newQuantity);
    } catch (error) {
      console.error('Error updating cart item:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await actions.removeFromCart(id);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const calculateSubtotal = () => {
    return state.cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.2; // 20% VAT
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Кошик ({state.cartCount})
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {state.cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Кошик порожній
                </h3>
                <p className="text-gray-500 mb-6">
                  Додайте товари в кошик, щоб зробити замовлення
                </p>
                <button
                  onClick={onClose}
                  className="btn-primary"
                >
                  Продовжити покупки
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {state.cart.map((item) => {
                  const primaryImage = item.product.images.find(img => img.isPrimary) || item.product.images[0];
                  
                  return (
                    <div key={item.id} className="flex gap-3 p-3 border border-gray-200 rounded-lg">
                      <img
                        src={primaryImage?.url || '/api/placeholder/80/80'}
                        alt={primaryImage?.alt || item.product.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.product.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        
                        <p className="text-sm text-gray-500 mt-1">
                          {item.product.price.toLocaleString('uk-UA')} ₴
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={updating === item.id}
                              className="p-1 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                              {updating === item.id ? '...' : item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={updating === item.id}
                              className="p-1 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.cart.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Price Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Підсумок:</span>
                  <span className="font-medium">
                    {calculateSubtotal().toLocaleString('uk-UA')} ₴
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ПДВ (20%):</span>
                  <span className="font-medium">
                    {calculateTax().toLocaleString('uk-UA')} ₴
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
                  <span>До сплати:</span>
                  <span className="text-primary-600">
                    {calculateTotal().toLocaleString('uk-UA')} ₴
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Link
                  href="/cart"
                  className="w-full btn-outline btn-sm block text-center"
                  onClick={onClose}
                >
                  Переглянути кошик
                </Link>
                <Link
                  href="/checkout"
                  className="w-full btn-primary btn-sm block text-center"
                  onClick={onClose}
                >
                  Оформити замовлення
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
