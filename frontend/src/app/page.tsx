import Hero from '@/components/sections/Hero'
import FeaturedProducts from '@/components/sections/FeaturedProducts'
import Categories from '@/components/sections/Categories'
import Features from '@/components/sections/Features'
import Newsletter from '@/components/sections/Newsletter'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Features />
      <Newsletter />
    </main>
  )
}
