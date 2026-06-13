import { formatGhs } from '@/lib/format-currency'

export function generateWhatsAppLink(
  productName: string,
  price: number | string,
  userName?: string,
): string {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER || '').replace(/\D/g, '')
  const priceLabel = formatGhs(typeof price === 'number' ? price : Number(price) || 0)
  const message = encodeURIComponent(
    `Hi Lumin MedSpa! I'd like to order:\n\n*${productName}* — ${priceLabel}${userName ? `\n\nName: ${userName}` : ''}\n\nPlease let me know how to proceed. Thank you!`,
  )
  return `https://wa.me/${number}?text=${message}`
}
