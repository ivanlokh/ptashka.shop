'use client'

import { useState, useEffect } from 'react'
import { Heart, Star, ShoppingCart, Eye } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  stock: number;
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    isPrimary: boolean;
  }>;
  _count: {
    reviews: number;
  };
}

export default function FeaturedProducts() {
  const { actions } = useApp()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState<string[]>([])

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      const response = await apiClient.getFeaturedProducts(8)
      if (response.success) {
        setProducts(response.data)
      }
    } catch (error) {
      console.error('Error loading featured products:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const addToCart = async (productId: string) => {
    try {
      await actions.addToCart(productId, 1)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const viewProduct = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  const getBadge = (product: Product, index: number) => {
    if (index === 0) return 'Хіт продажів'
    if (product.comparePrice && product.comparePrice > product.price) return 'Знижка'
    if (index === 1) return 'Новинка'
    return 'Популярне'
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Хіт продажів': return 'bg-red-500 text-white'
      case 'Новинка': return 'bg-green-500 text-white'
      case 'Знижка': return 'bg-orange-500 text-white'
      default: return 'bg-blue-500 text-white'
    }
  }

  if (loading) {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
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
          {products.map((product, index) => {
            const badge = getBadge(product, index)
            const badgeColor = getBadgeColor(badge)
            const primaryImage = product.images.find(img => img.isPrimary) || product.images[0]
            const inStock = product.stock > 0

            return (
              <div key={product.id} className="product-card group">
                <div className="relative overflow-hidden">
                  <img
                    src={primaryImage?.url || '/api/placeholder/300/300'}
                    alt={primaryImage?.alt || product.name}
                    className="product-card-image"
                  />
                  
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeColor}`}>
                      {badge}
                    </span>
                  </div>

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

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                    <button 
                      onClick={() => viewProduct(product.id)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="h-4 w-4 text-gray-700" />
                    </button>
                    <button 
                      onClick={() => addToCart(product.id)}
                      disabled={!inStock}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>

                  {!inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium">Немає в наявності</span>
                    </div>
                  )}
                </div>

                <div className="product-card-content">
                  <h3 className="product-card-title">
                    {product.name}
                  </h3>

                  <div className="flex items-center space-x-1 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-gray-300"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({product._count.reviews})
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <span className="product-card-price">
                      {product.price.toLocaleString('uk-UA')} ₴
                    </span>
                    {product.comparePrice && (
                      <span className="product-card-price-old">
                        {product.comparePrice.toLocaleString('uk-UA')} ₴
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={!inStock}
                    className="w-full btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {inStock ? 'Додати в кошик' : 'Немає в наявності'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <button 
            onClick={() => router.push('/products')}
            className="btn-outline btn-lg"
          >
            Переглянути всі товари
          </button>
        </div>
      </div>
    </section>
  )
}