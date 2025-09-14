'use client'

import { useState } from 'react'
import { ChevronRight, Smartphone, Laptop, Headphones, Camera, Gamepad2, Watch } from 'lucide-react'

const categories = [
  {
    id: 1,
    name: 'Смартфони',
    slug: 'smartphones',
    icon: Smartphone,
    color: 'bg-blue-500',
    count: 156,
  },
  {
    id: 2,
    name: 'Ноутбуки',
    slug: 'laptops',
    icon: Laptop,
    color: 'bg-gray-500',
    count: 89,
  },
  {
    id: 3,
    name: 'Навушники',
    slug: 'headphones',
    icon: Headphones,
    color: 'bg-green-500',
    count: 234,
  },
  {
    id: 4,
    name: 'Камери',
    slug: 'cameras',
    icon: Camera,
    color: 'bg-purple-500',
    count: 67,
  },
  {
    id: 5,
    name: 'Ігрові консолі',
    slug: 'gaming',
    icon: Gamepad2,
    color: 'bg-red-500',
    count: 45,
  },
  {
    id: 6,
    name: 'Годинники',
    slug: 'watches',
    icon: Watch,
    color: 'bg-yellow-500',
    count: 123,
  },
]

export default function Categories() {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null)

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Популярні категорії
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Оберіть категорію товарів, яка вас цікавить, та знайдіть ідеальні рішення
          </p>
        </div>

        <div className="category-grid">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <div
                key={category.id}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="card-hover p-6 text-center space-y-4 h-full">
                  <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {category.count} товарів
                    </p>
                  </div>

                  <div className="flex items-center justify-center text-primary-600 group-hover:text-primary-700 transition-colors">
                    <span className="text-sm font-medium">Переглянути</span>
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <button className="btn-outline btn-lg">
            Переглянути всі категорії
          </button>
        </div>
      </div>
    </section>
  )
}
