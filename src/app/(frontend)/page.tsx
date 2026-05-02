import { HeroSection } from '@/components/home/HeroSection'
import { ServicesPreview } from '@/components/home/ServicesPreview'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesPreview />
      <FeaturedProducts />
    </>
  )
}
