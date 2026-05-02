'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { generateWhatsAppLink } from '@/lib/whatsapp'
import { useState } from 'react'
import { ProductModal } from './ProductModal'

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category?: string
}

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.07, duration: 0.5 }}
        className="bg-white border border-[#E0DCD9] rounded-xl overflow-hidden group hover:border-[#F4D1C5] transition-all duration-200"
      >
        <div
          className="aspect-square bg-[#F4D1C5]/10 relative overflow-hidden cursor-pointer"
          onClick={() => setOpen(true)}
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">
              ✦
            </div>
          )}
        </div>

        <div className="p-5">
          <button onClick={() => setOpen(true)} className="text-left w-full mb-4">
            <h3 className="font-medium text-[#4A4A4A] hover:text-[#E8B8A8] transition-colors">
              {product.name}
            </h3>
            {product.category && (
              <p className="text-xs text-[#4A4A4A]/50 capitalize mt-0.5">
                {product.category}
              </p>
            )}
          </button>

          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-[#4A4A4A]">
              ${product.price}
            </span>
            <a
              href={generateWhatsAppLink(product.name, String(product.price))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" size="sm">Order via WhatsApp</Button>
            </a>
          </div>
        </div>
      </motion.div>

      <ProductModal product={product} open={open} onClose={() => setOpen(false)} />
    </>
  )
}
