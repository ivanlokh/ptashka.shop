'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Grid, List, SortAsc } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import Link from 'next/link';

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
  category: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    reviews: number;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const { state, actions } = useApp();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [searchQuery, selectedCategory, sortBy, sortOrder]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      if (response.success) {
        setCategories(response.data.filter((cat: Category) => cat.isActive));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        sortBy,
        sortOrder,
        limit: 20,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.categoryId = selectedCategory;

      const response = await apiClient.getProducts(params);
      if (response.success) {
        setProducts(response.data.products || response.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    actions.setSearchQuery(searchQuery);
    loadProducts();
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    actions.setSelectedCategory(categoryId);
  };

  const addToCart = async (productId: string) => {
    try {
      await actions.addToCart(productId, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Каталог товарів
          </h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Пошук товарів..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              Фільтри
            </button>
          </div>

          {/* Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категорії
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Всі категорії</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Сортування
                  </label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field as 'name' | 'price' | 'createdAt');
                      setSortOrder(order as 'asc' | 'desc');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="createdAt-desc">Новинки спочатку</option>
                    <option value="createdAt-asc">Старі спочатку</option>
                    <option value="price-asc">Ціна: від низької до високої</option>
                    <option value="price-desc">Ціна: від високої до низької</option>
                    <option value="name-asc">Назва: А-Я</option>
                    <option value="name-desc">Назва: Я-А</option>
                  </select>
                </div>

                {/* View Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Вигляд
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md ${
                        viewMode === 'grid'
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md ${
                        viewMode === 'list'
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Товари не знайдено
            </h3>
            <p className="text-gray-500">
              Спробуйте змінити параметри пошуку або фільтри
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {products.map((product) => {
              const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
              const inStock = product.stock > 0;

              if (viewMode === 'list') {
                return (
                  <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex gap-4">
                    <img
                      src={primaryImage?.url || '/api/placeholder/150/150'}
                      alt={primaryImage?.alt || product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-medium text-gray-900 hover:text-primary-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">{product.category.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-gray-900">
                            {product.price.toLocaleString('uk-UA')} ₴
                          </span>
                          {product.comparePrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {product.comparePrice.toLocaleString('uk-UA')} ₴
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => addToCart(product.id)}
                          disabled={!inStock}
                          className="btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {inStock ? 'В кошик' : 'Немає'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={product.id} className="product-card group">
                  <div className="relative overflow-hidden">
                    <Link href={`/products/${product.id}`}>
                      <img
                        src={primaryImage?.url || '/api/placeholder/300/300'}
                        alt={primaryImage?.alt || product.name}
                        className="product-card-image"
                      />
                    </Link>
                    
                    {!inStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-medium">Немає в наявності</span>
                      </div>
                    )}
                  </div>

                  <div className="product-card-content">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="product-card-title hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>

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
              );
            })}
          </div>
        )}

        {/* Load More */}
        {products.length > 0 && (
          <div className="text-center mt-12">
            <button className="btn-outline btn-lg">
              Завантажити більше
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
