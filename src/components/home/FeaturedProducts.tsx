import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductCard } from './ProductCard'

export async function FeaturedProducts() {
  let products: { id: string; name: string; price: number; imageUrl: string }[] = []
  try {
    products = await prisma.product.findMany({ where: { isAvailable: true }, orderBy: { createdAt: 'asc' }, take: 3 })
  } catch { /* placeholder */ }

  const displayProducts = products.length > 0 ? products : [
    { id: '1', name: 'Hydrating Serum', price: 68, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600' },
    { id: '2', name: 'Glow Moisturizer', price: 85, imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38796?w=600' },
    { id: '3', name: 'Mineral SPF 50', price: 42, imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600' },
  ]

  return (
    <section className="py-20 md:py-32 border-t" style={{ backgroundColor: '#E5D9C8', borderColor: '#D6C8B0' }}>
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[10px] tracking-[0.28em] uppercase block mb-5" style={{ color: '#9C8060' }}>Shop the Glow</span>
            <h2 className="leading-[0.9]" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(2.8rem, 6vw, 5.5rem)', color: '#2A1F14' }}>
              Curated <em>Products</em>
            </h2>
          </div>
          <Link href="/shop" className="text-[10px] tracking-[0.28em] uppercase flex items-center gap-3 group transition-colors" style={{ color: '#9C8060' }}>
            View all <span className="h-px w-6 group-hover:w-10 transition-all inline-block" style={{ backgroundColor: '#9C8060' }} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
