import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URI })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

async function seed() {
  console.log('✦ Seeding Lumin MedSpa...\n')

  // Clear in dependency order
  await prisma.profileProduct.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.staffService.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.staff.deleteMany()
  await prisma.service.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()
  console.log('  ✓ Cleared existing data\n')

  // ── Services ──────────────────────────────────────────────────────────
  const s1 = await prisma.service.create({ data: { name: 'HydraFacial', description: 'A multi-step facial treatment that cleanses, exfoliates, and hydrates using vortex-fusion technology. Ideal for all skin types.', durationMinutes: 60, price: 195, benefits: ['Deep cleansing and exfoliation', '72-hour hydration boost', 'Reduces fine lines'] } })
  const s2 = await prisma.service.create({ data: { name: 'LED Light Therapy', description: 'Non-invasive photobiomodulation using red and near-infrared wavelengths to stimulate collagen and reduce inflammation.', durationMinutes: 30, price: 85, benefits: ['Boosts collagen production', 'Reduces redness', 'Improves skin tone'] } })
  const s3 = await prisma.service.create({ data: { name: 'Microneedling', description: "Controlled micro-injuries stimulate the skin's healing response, boosting collagen and elastin for smoother, firmer skin.", durationMinutes: 75, price: 299, benefits: ['Stimulates natural collagen', 'Reduces acne scars', 'Improves firmness'] } })
  const s4 = await prisma.service.create({ data: { name: 'Chemical Peel', description: 'A precisely formulated exfoliation treatment that removes damaged surface cells to reveal brighter, more even-toned skin.', durationMinutes: 45, price: 145, benefits: ['Brightens skin tone', 'Reduces pigmentation', 'Smooths texture'] } })
  console.log('  ✓ Services: 4 created')

  // ── Products ──────────────────────────────────────────────────────────
  await prisma.product.createMany({ data: [
    { name: 'Luminance Hydrating Serum', description: 'Hyaluronic acid-rich serum for 72-hour moisture retention.', price: 68, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600', category: 'serum' },
    { name: 'Glow Renewal Moisturizer', description: 'Ceramide and peptide cream for lasting radiance and barrier repair.', price: 85, imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38796?w=600', category: 'moisturizer' },
    { name: 'Mineral SPF 50 Shield', description: 'Lightweight mineral broad-spectrum SPF 50, safe for sensitive skin.', price: 42, imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600', category: 'spf' },
    { name: 'Brightening Vitamin C Serum', description: '15% stabilized Vitamin C serum that fades dark spots and boosts radiance.', price: 72, imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600', category: 'serum' },
    { name: 'Gentle Micellar Cleanser', description: 'pH-balanced, fragrance-free cleanser safe for post-treatment skin.', price: 34, imageUrl: 'https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=600', category: 'cleanser' },
  ]})
  console.log('  ✓ Products: 5 created')

  // ── Staff ─────────────────────────────────────────────────────────────
  const staff1 = await prisma.staff.create({ data: { name: 'Dr. Amara Osei', role: 'Lead Skin Therapist', bio: 'Board-certified dermal therapist with 8+ years in non-invasive skin rejuvenation.' } })
  const staff2 = await prisma.staff.create({ data: { name: 'Priya Nair', role: 'Aesthetic Nurse', bio: 'Registered nurse specializing in LED phototherapy, HydraFacial, and post-treatment care.' } })

  await prisma.staffService.createMany({ data: [
    { staffId: staff1.id, serviceId: s1.id },
    { staffId: staff1.id, serviceId: s2.id },
    { staffId: staff1.id, serviceId: s3.id },
    { staffId: staff1.id, serviceId: s4.id },
    { staffId: staff2.id, serviceId: s1.id },
    { staffId: staff2.id, serviceId: s2.id },
  ]})
  console.log('  ✓ Staff: 2 created')

  // ── Admin user ────────────────────────────────────────────────────────
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@luminmedspa.com').trim().toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD || 'lumin-admin-2024'
  await prisma.user.create({
    data: {
      email: adminEmail,
      fullName: 'Lumin Admin',
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: 'ADMIN',
    },
  })
  console.log(`  ✓ Admin: ${adminEmail}`)

  // ── Demo client ───────────────────────────────────────────────────────
  const demoClient = await prisma.user.create({
    data: {
      email: 'demo@luminmedspa.com',
      fullName: 'Demo Client',
      phone: '+1 (555) 000-0001',
      passwordHash: await bcrypt.hash('demo-client-2024', 10),
      role: 'CLIENT',
    },
  })

  const profile = await prisma.profile.create({
    data: {
      userId: demoClient.id,
      skinGoals: 'Reduce hyperpigmentation and improve overall hydration',
      practitionerComments: 'Responds well to HydraFacial treatments. Consider LED series.',
      cosmeticNotes: 'Sensitive to fragranced products. Prefers mineral-based options.',
      technicianRecommendations:
        'Book HydraFacial every 6–8 weeks; add one LED session between visits for pigment. Daily SPF 50 every morning.',
      glowRoadmap:
        'Phase 1 (weeks 1–6): Hydration + barrier repair. Phase 2 (weeks 6–12): Target pigment with gentle peels. Phase 3: Maintenance and home routine tweaks as needed.',
    },
  })

  const allProducts = await prisma.product.findMany({ take: 2 })
  await prisma.profileProduct.createMany({
    data: allProducts.map(p => ({ profileId: profile.id, productId: p.id })),
  })

  await prisma.appointment.create({
    data: {
      clientName: demoClient.fullName,
      clientEmail: demoClient.email,
      clientPhone: demoClient.phone!,
      serviceId: s1.id,
      staffId: staff1.id,
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      status: 'CONFIRMED',
      userId: demoClient.id,
    },
  })
  console.log(`  ✓ Demo client: ${demoClient.email}`)

  console.log('\n✦ Seed complete.')
  console.log(`  Admin:  ${adminEmail} / ${adminPassword}`)
  console.log('  Client: demo@luminmedspa.com / demo-client-2024')
}

seed()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
