'use client';

import { useState } from 'react';
import Cart from '@/components/cart/Cart';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images?: string[];
  description?: string;
}

export default function CartPage() {
  // Sample cart data - in a real app, this would come from state management
  const [items, setItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Sample Product 1',
      price: 29.99,
      quantity: 2,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'],
      description: 'High-quality sample product',
    },
    {
      id: '2',
      name: 'Sample Product 2',
      price: 49.99,
      quantity: 1,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'],
      description: 'Premium sample product',
    },
  ]);

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(id);
    } else {
      setItems(items.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  return (
    <Cart
      items={items}
      onRemoveItem={handleRemoveItem}
      onUpdateQuantity={handleUpdateQuantity}
    />
  );
}
