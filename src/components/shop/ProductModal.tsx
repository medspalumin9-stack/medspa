'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { generateWhatsAppLink } from '@/lib/whatsapp'

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category?: string
}

export function ProductModal({
  product,
  open,
  onClose,
}: {
  product: Product
  open: boolean
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-xl border border-[#E0DCD9]"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="aspect-video bg-[#F4D1C5]/10 relative">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
                  ✦
                </div>
              )}
            </div>

            <div className="p-6">
              {product.category && (
                <p className="text-xs font-medium uppercase tracking-[0.05em] text-[#E8B8A8] mb-2">
                  {product.category}
                </p>
              )}
              <h2 className="text-2xl font-semibold text-[#4A4A4A] mb-3">
                {product.name}
              </h2>
              <p className="text-sm text-[#4A4A4A]/60 leading-relaxed mb-6">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#4A4A4A]">
                  ${product.price}
                </span>
                <a
                  href={generateWhatsAppLink(product.name, String(product.price))}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary">Order via WhatsApp</Button>
                </a>
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-[#4A4A4A] hover:bg-[#E0DCD9] transition-colors text-sm"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
