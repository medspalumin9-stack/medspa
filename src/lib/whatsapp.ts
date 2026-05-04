export function generateWhatsAppLink(
  productName: string,
  price: string,
  userName?: string
): string {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER || '').replace(/\D/g, '')
  const message = encodeURIComponent(
    `Hi Lumin MedSpa! I'd like to order:\n\n*${productName}* — $${price}${userName ? `\n\nName: ${userName}` : ''}\n\nPlease let me know how to proceed. Thank you!`
  )
  return `https://wa.me/${number}?text=${message}`
}
