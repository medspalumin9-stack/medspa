import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/shop/ProductCard'
import { AdminCatalogBar } from '@/components/admin/AdminCatalogBar'
import type { Metadata } from 'next'
import '@/styles/blissoria-services-scope.css'
import '@/styles/admin-blissoria.css'

export const metadata: Metadata = { title: 'Shop | Lumin MedSpa' }

const PLACEHOLDER_PRODUCTS = [
  {
    id: '1',
    name: 'Luminance Hydrating Serum',
    description: 'A lightweight, hyaluronic acid-rich serum delivering 72-hour moisture retention.',
    price: 68,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    category: 'serum',
  },
  {
    id: '2',
    name: 'Glow Renewal Moisturizer',
    description: 'Locks in treatment results with ceramides and peptides for lasting radiance.',
    price: 85,
    imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38796?w=400',
    category: 'moisturizer',
  },
  {
    id: '3',
    name: 'Mineral SPF 50 Shield',
    description: 'Lightweight mineral sunscreen that protects post-treatment skin without clogging pores.',
    price: 42,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    category: 'spf',
  },
  {
    id: '4',
    name: 'Brightening Vitamin C Serum',
    description: 'A 15% stabilized Vitamin C serum that fades dark spots and boosts a luminous glow.',
    price: 72,
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
    category: 'serum',
  },
]

export default async function ShopPage() {
  let products: any[] = []
  try {
    products = await prisma.product.findMany({
      where: { isAvailable: true },
      orderBy: { createdAt: 'asc' },
    })
  } catch {
    products = PLACEHOLDER_PRODUCTS
  }

  const displayProducts = products.length > 0 ? products : PLACEHOLDER_PRODUCTS

  return (
    <div className="blissoria-services-scope min-h-screen">
      <AdminCatalogBar
        adminHref="/admin/products"
        ctaLabel="Edit or delete shop items"
        message="Manage products for this shop — update copy, price, and availability in admin."
      />
      <section className="services services-tight-nav">
        <div className="container">
          <div className="services-wrapper">
            <div className="services-title-wrap">
              <p className="service-card-kicker">The boutique</p>
              <h1 className="services-title">My Shop</h1>
              <p className="service-card-text mt-4 max-w-2xl">
                Curated skincare to extend your glow at home. Tap WhatsApp on any product to message our team.
              </p>
            </div>
            <div className="services-cards-wrap">
              <div className="service-list-wrapper">
                <div role="list" className="service-list">
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
