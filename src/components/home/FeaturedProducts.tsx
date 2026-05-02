import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { getPayloadClient } from '@/lib/payload'
import { generateWhatsAppLink } from '@/lib/whatsapp'

export async function FeaturedProducts() {
  let products: any[] = []
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'products',
      where: { isAvailable: { equals: true } },
      limit: 3,
    })
    products = docs
  } catch {
    // DB not connected yet — render empty state
  }

  return (
    <section className="py-24 bg-white/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.1em] text-[#E8B8A8] block mb-3">
              Curated For You
            </span>
            <h2 className="text-4xl font-semibold tracking-[-0.02em] text-[#4A4A4A]">
              Shop The Glow
            </h2>
          </div>
          <Link href="/shop">
            <Button variant="outline">View All Products</Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Hydrating Serum', 'Glow Moisturizer', 'Mineral SPF 50'].map((name) => (
              <div
                key={name}
                className="bg-white border border-[#E0DCD9] rounded-xl overflow-hidden"
              >
                <div className="aspect-square bg-[#F4D1C5]/10 flex items-center justify-center">
                  <span className="text-4xl opacity-20">✦</span>
                </div>
                <div className="p-5">
                  <h3 className="font-medium text-[#4A4A4A] mb-1">{name}</h3>
                  <p className="text-sm text-[#4A4A4A]/60 mb-4">Coming soon</p>
                  <Link href="/shop">
                    <Button variant="secondary" size="sm" className="w-full">
                      View Shop
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-[#E0DCD9] rounded-xl overflow-hidden group hover:border-[#F4D1C5] transition-colors duration-200"
              >
                <div className="aspect-square bg-[#F4D1C5]/10 relative overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
                      ✦
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-medium text-[#4A4A4A] mb-1">{product.name}</h3>
                  <p className="text-sm text-[#4A4A4A]/60 mb-4">${product.price}</p>
                  <a
                    href={generateWhatsAppLink(product.name, String(product.price))}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="secondary" size="sm" className="w-full">
                      Order via WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
