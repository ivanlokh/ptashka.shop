'use client'

import { useState } from 'react'
import { Heart, Star, ShoppingCart, Eye } from 'lucide-react'

const featuredProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    price: 45999,
    originalPrice: 49999,
    rating: 4.8,
    reviewCount: 124,
    image: '/api/placeholder/300/300',
    badge: 'Хіт продажів',
    inStock: true,
  },
  {
    id: 2,
    name: 'MacBook Air M2',
    price: 32999,
    originalPrice: 35999,
    rating: 4.9,
    reviewCount: 89,
    image: '/api/placeholder/300/300',
    badge: 'Новинка',
    inStock: true,
  },
  {
    id: 3,
    name: 'AirPods Pro 2',
    price: 8999,
    originalPrice: 9999,
    rating: 4.7,
    reviewCount: 256,
    image: '/api/placeholder/300/300',
    badge: 'Знижка',
    inStock: true,
  },
  {
    id: 4,
    name: 'Samsung Galaxy S24 Ultra',
    price: 38999,
    originalPrice: 42999,
    rating: 4.6,
    reviewCount: 78,
    image: '/api/placeholder/300/300',
    badge: 'Популярне',
    inStock: false,
  },
]

export default function FeaturedProducts() {
  const [wishlist, setWishlist] = useState<number[]>([])

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const addToCart = (productId: number) => {
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', productId)
  }

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Рекомендовані товари
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Найпопулярніші та найкращі товари, обрані нашими експертами
          </p>
        </div>

        <div className="product-grid">
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card group">
              {/* Product Image */}
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-card-image"
                />
                
                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    product.badge === 'Хіт продажів' ? 'bg-red-500 text-white' :
                    product.badge === 'Новинка' ? 'bg-green-500 text-white' :
                    product.badge === 'Знижка' ? 'bg-orange-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {product.badge}
                  </span>
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      wishlist.includes(product.id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-gray-400'
                    }`} 
                  />
                </button>

                {/* Quick Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                    <Eye className="h-4 w-4 text-gray-700" />
                  </button>
                  <button 
                    onClick={() => addToCart(product.id)}
                    disabled={!product.inStock}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-4 w-4 text-gray-700" />
                  </button>
                </div>

                {/* Out of Stock Overlay */}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-medium">Немає в наявності</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="product-card-content">
                <h3 className="product-card-title">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({product.reviewCount})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2">
                  <span className="product-card-price">
                    {product.price.toLocaleString('uk-UA')} ₴
                  </span>
                  {product.originalPrice && (
                    <span className="product-card-price-old">
                      {product.originalPrice.toLocaleString('uk-UA')} ₴
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => addToCart(product.id)}
                  disabled={!product.inStock}
                  className="w-full mt-4 btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.inStock ? 'Додати в кошик' : 'Немає в наявності'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Products Button */}
        <div className="text-center mt-12">
          <button className="btn-outline btn-lg">
            Переглянути всі товари
          </button>
        </div>
      </div>
    </section>
  )
}
