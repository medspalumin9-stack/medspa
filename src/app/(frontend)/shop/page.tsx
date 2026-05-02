import { getPayloadClient } from '@/lib/payload'
import { ProductCard } from '@/components/shop/ProductCard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Shop | Lumin MedSpa' }

const PLACEHOLDER_PRODUCTS = [
  { id: '1', name: 'Luminance Hydrating Serum', description: 'A lightweight, hyaluronic acid-rich serum delivering 72-hour moisture retention for a plump, radiant complexion.', price: 68, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', category: 'serum' },
  { id: '2', name: 'Glow Renewal Moisturizer', description: 'A nourishing cream that locks in treatment results with ceramides and peptides for lasting radiance.', price: 85, imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38796?w=400', category: 'moisturizer' },
  { id: '3', name: 'Mineral SPF 50 Shield', description: 'Lightweight mineral sunscreen that protects post-treatment skin without clogging pores.', price: 42, imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'spf' },
  { id: '4', name: 'Brightening Vitamin C Serum', description: 'A potent antioxidant serum that fades dark spots and boosts collagen for a luminous glow.', price: 72, imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400', category: 'serum' },
]

export default async function ShopPage() {
  let products: any[] = []
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'products',
      where: { isAvailable: { equals: true } },
      limit: 50,
    })
    products = docs
  } catch {
    products = PLACEHOLDER_PRODUCTS
  }

  const displayProducts = products.length > 0 ? products : PLACEHOLDER_PRODUCTS

  return (
    <div className="min-h-screen bg-[#F9F7F5]">
      <div className="border-b border-[#E0DCD9]">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.1em] text-[#E8B8A8] block mb-4">
            Shop The Glow
          </span>
          <h1 className="text-5xl font-bold tracking-[-0.02em] text-[#4A4A4A] mb-4">
            Curated Cosmetics
          </h1>
          <p className="text-lg text-[#4A4A4A]/60 leading-relaxed max-w-xl mx-auto">
            Professionally selected skincare to extend your glow between
            treatments. Order directly via WhatsApp.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {displayProducts.map((product, i) => (
            <ProductCard
              key={product.id}
              product={{
                id: String(product.id),
                name: product.name,
                description: product.description,
                price: product.price,
                imageUrl: product.imageUrl || '',
                category: product.category,
              }}
              index={i}
            />
          ))}
        </div>

        <div className="mt-16 bg-white border border-[#E0DCD9] rounded-2xl p-8 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#E8B8A8] mb-2">
            How It Works
          </p>
          <h3 className="text-2xl font-semibold text-[#4A4A4A] mb-3">
            Order via WhatsApp
          </h3>
          <p className="text-[#4A4A4A]/60 max-w-md mx-auto text-sm leading-relaxed">
            Click "Order via WhatsApp" on any product to send a pre-filled
            message directly to our team. We'll confirm availability and
            arrange delivery.
          </p>
        </div>
      </div>
    </div>
  )
}
