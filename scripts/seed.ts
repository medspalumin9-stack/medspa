import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function seed() {
  const payload = await getPayload({ config: configPromise })

  console.log('✦ Seeding Lumin MedSpa...\n')

  // Services
  const services = [
    {
      name: 'HydraFacial',
      description: 'A multi-step facial treatment that cleanses, exfoliates, and hydrates the skin using vortex-fusion technology. Ideal for all skin types with immediate, visible results.',
      durationMinutes: 60,
      price: 195,
      benefits: [
        { benefit: 'Deep cleansing and exfoliation' },
        { benefit: '72-hour hydration boost' },
        { benefit: 'Reduces fine lines and wrinkles' },
      ],
      isActive: true,
    },
    {
      name: 'LED Light Therapy',
      description: 'Non-invasive photobiomodulation using red and near-infrared wavelengths to stimulate collagen production, reduce inflammation, and accelerate skin healing.',
      durationMinutes: 30,
      price: 85,
      benefits: [
        { benefit: 'Boosts collagen production' },
        { benefit: 'Reduces redness and inflammation' },
        { benefit: 'Improves skin tone and texture' },
      ],
      isActive: true,
    },
    {
      name: 'Microneedling',
      description: "Controlled micro-injuries stimulate the skin's natural healing response, boosting collagen and elastin for smoother, firmer, more youthful-looking skin.",
      durationMinutes: 75,
      price: 299,
      benefits: [
        { benefit: 'Stimulates natural collagen' },
        { benefit: 'Reduces acne scars and pores' },
        { benefit: 'Improves skin firmness' },
      ],
      isActive: true,
    },
    {
      name: 'Chemical Peel',
      description: 'A precisely formulated exfoliation treatment that removes damaged surface cells to reveal brighter, more even-toned and radiant skin underneath.',
      durationMinutes: 45,
      price: 145,
      benefits: [
        { benefit: 'Brightens and evens skin tone' },
        { benefit: 'Reduces pigmentation' },
        { benefit: 'Smooths skin texture' },
      ],
      isActive: true,
    },
  ]

  const createdServices: any[] = []
  for (const s of services) {
    const created = await payload.create({ collection: 'services', data: s as any })
    createdServices.push(created)
    console.log(`  ✓ Service: ${s.name}`)
  }

  // Products
  const products = [
    {
      name: 'Luminance Hydrating Serum',
      description: 'A lightweight, hyaluronic acid-rich serum that delivers 72-hour moisture retention for a plump, radiant complexion. Perfect post-treatment.',
      price: 68,
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',
      category: 'serum',
      isAvailable: true,
    },
    {
      name: 'Glow Renewal Moisturizer',
      description: 'A nourishing cream that locks in treatment results with ceramides and peptides for lasting radiance and barrier repair.',
      price: 85,
      imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38796?w=600',
      category: 'moisturizer',
      isAvailable: true,
    },
    {
      name: 'Mineral SPF 50 Shield',
      description: 'A lightweight, mineral-based broad-spectrum SPF 50 that protects post-treatment skin without clogging pores or causing sensitivity.',
      price: 42,
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
      category: 'spf',
      isAvailable: true,
    },
    {
      name: 'Brightening Vitamin C Serum',
      description: 'A 15% stabilized Vitamin C serum that fades dark spots, boosts collagen synthesis, and delivers a luminous, even-toned glow.',
      price: 72,
      imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600',
      category: 'serum',
      isAvailable: true,
    },
    {
      name: 'Gentle Micellar Cleanser',
      description: 'A pH-balanced, fragrance-free cleanser that removes impurities without disrupting the skin barrier. Safe for sensitive and post-treatment skin.',
      price: 34,
      imageUrl: 'https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=600',
      category: 'cleanser',
      isAvailable: true,
    },
  ]

  for (const p of products) {
    await payload.create({ collection: 'products', data: p as any })
    console.log(`  ✓ Product: ${p.name}`)
  }

  // Staff
  const staff = [
    {
      name: 'Dr. Amara Osei',
      role: 'Lead Skin Therapist',
      bio: 'Board-certified dermal therapist with 8+ years specializing in non-invasive skin rejuvenation and advanced treatment protocols.',
      services: createdServices.map((s) => s.id),
      isActive: true,
    },
    {
      name: 'Priya Nair',
      role: 'Aesthetic Nurse',
      bio: 'Registered nurse and aesthetic specialist focused on LED phototherapy, HydraFacial, and post-treatment skin care.',
      services: createdServices.slice(0, 2).map((s) => s.id),
      isActive: true,
    },
  ]

  for (const s of staff) {
    await payload.create({ collection: 'staff', data: s as any })
    console.log(`  ✓ Staff: ${s.name}`)
  }

  console.log('\n✦ Seed complete. Visit /admin to log in.')
  process.exit(0)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
