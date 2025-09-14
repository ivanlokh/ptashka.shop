'use client'

import { Truck, Shield, RefreshCw, Headphones, CreditCard, Award } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Швидка доставка',
    description: 'Доставка по всій Україні за 1-3 дні',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: Shield,
    title: 'Гарантія якості',
    description: 'Офіційна гарантія на всі товари',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    icon: RefreshCw,
    title: 'Легкий повернення',
    description: 'Повернення товарів протягом 14 днів',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    icon: Headphones,
    title: 'Підтримка 24/7',
    description: 'Круглодобова служба підтримки',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    icon: CreditCard,
    title: 'Безпечна оплата',
    description: 'Захищені способи оплати',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    icon: Award,
    title: 'Найкращі ціни',
    description: 'Конкурентні ціни на всі товари',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
]

export default function Features() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Чому обирають нас
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ми прагнемо надати найкращий сервіс та якість для наших клієнтів
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-200"
              >
                <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
