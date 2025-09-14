import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import StripeProvider from '@/components/providers/StripeProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Ptashka.shop - Сучасний інтернет-магазин',
  description: 'Сучасний інтернет-магазин з акцентом на зручність користувача та швидкість роботи',
  keywords: ['інтернет-магазин', 'онлайн-покупки', 'електроніка', 'товари'],
  authors: [{ name: 'Ptashka.shop Team' }],
  openGraph: {
    title: 'Ptashka.shop - Сучасний інтернет-магазин',
    description: 'Сучасний інтернет-магазин з акцентом на зручність користувача та швидкість роботи',
    type: 'website',
    locale: 'uk_UA',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">
        <StripeProvider>
          <div id="root">
            {children}
          </div>
        </StripeProvider>
      </body>
    </html>
  )
}
