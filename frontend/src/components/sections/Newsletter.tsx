'use client'

import { useState } from 'react'
import { Mail, CheckCircle } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // TODO: Implement newsletter subscription
    setTimeout(() => {
      setIsSubscribed(true)
      setIsLoading(false)
      setEmail('')
    }, 1000)
  }

  if (isSubscribed) {
    return (
      <section className="section-padding bg-primary-600">
        <div className="container-custom">
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Дякуємо за підписку!
            </h2>
            <p className="text-primary-100">
              Ви будете отримувати найкращі пропозиції на вашу електронну пошту
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section-padding bg-primary-600">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Отримуйте найкращі пропозиції
            </h2>
            
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Підпишіться на нашу розсилку та отримуйте ексклюзивні знижки, 
              новинки та спеціальні пропозиції
            </p>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    placeholder="Ваша електронна пошта"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="spinner"></div>
                  ) : (
                    'Підписатися'
                  )}
                </button>
              </div>
            </form>

            <p className="text-sm text-primary-200">
              Ми не розсилаємо спам. Відписатися можна в будь-який час.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
