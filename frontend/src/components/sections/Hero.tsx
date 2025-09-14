'use client'

import { useState } from 'react'
import { Search, ShoppingBag, Star, Truck, Shield, RefreshCw } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const { state, actions } = useApp()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(state.searchQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      actions.setSearchQuery(searchQuery)
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-primary-50 to-accent-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gray-100 bg-opacity-40"></div>
      </div>
      
      <div className="container-custom section-padding relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Знайдіть ідеальні товари для{' '}
                <span className="text-gradient">вашого дому</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
                Широкий вибір якісних товарів за доступними цінами. 
                Швидка доставка по всій Україні та гарантія якості.
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Шукайте товари, бренди, категорії..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input pl-12 pr-32"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary btn-sm"
                >
                  Пошук
                </button>
              </div>
            </form>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Truck className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Швидка доставка</p>
                  <p className="text-xs text-gray-500">1-3 дні</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Гарантія якості</p>
                  <p className="text-xs text-gray-500">30 днів</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <RefreshCw className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Легкий повернення</p>
                  <p className="text-xs text-gray-500">14 днів</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <ShoppingBag className="h-24 w-24 text-primary-600 mx-auto" />
                  <h3 className="text-2xl font-bold text-gray-900">Тисячі товарів</h3>
                  <p className="text-gray-600">Найкращі пропозиції щодня</p>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-accent-500 text-white p-3 rounded-full shadow-lg animate-bounce-gentle">
              <Star className="h-6 w-6" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-primary-500 text-white p-3 rounded-full shadow-lg animate-bounce-gentle" style={{ animationDelay: '1s' }}>
              <Truck className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
