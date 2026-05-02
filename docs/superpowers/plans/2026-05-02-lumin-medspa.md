# LUMIN MEDSPA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack MedSpa webapp with public-facing pages, multi-step booking, client dashboard with personalized recommendations, and admin CMS.

**Architecture:** Next.js 16 App Router hosts both the public frontend and the Payload CMS admin panel (integrated via `@payloadcms/next`). Payload Collections define all data models and provide the admin UI for staff. NextAuth.js handles client-facing authentication separately from Payload's built-in admin auth. Vercel Cron triggers appointment reminders at intervals.

**Tech Stack:** Next.js 16, Payload CMS 3.x, PostgreSQL (Neon), NextAuth.js v5, Resend, Twilio, Tailwind CSS v4, Framer Motion 11, TypeScript

---

## File Map

```
LUMIN MEDSPA/
├── src/
│   ├── app/
│   │   ├── (frontend)/                    # Public routes (layout separate from admin)
│   │   │   ├── layout.tsx                 # Root layout (navbar, footer)
│   │   │   ├── page.tsx                   # Homepage
│   │   │   ├── services/page.tsx          # Services listing
│   │   │   ├── shop/page.tsx              # Product shop grid
│   │   │   ├── booking/page.tsx           # Multi-step booking flow
│   │   │   ├── booking/confirmation/page.tsx
│   │   │   ├── auth/
│   │   │   │   ├── signin/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   └── dashboard/
│   │   │       └── page.tsx               # Client dashboard (auth-protected)
│   │   ├── (payload)/
│   │   │   └── admin/[[...segments]]/page.tsx  # Payload admin UI
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── booking/route.ts           # POST create appointment
│   │       ├── booking/availability/route.ts  # GET available slots
│   │       └── cron/reminders/route.ts    # Vercel Cron endpoint
│   ├── collections/                       # Payload CMS data models
│   │   ├── Users.ts                       # Admin users (Payload auth)
│   │   ├── Clients.ts                     # Client users (NextAuth)
│   │   ├── Services.ts
│   │   ├── Products.ts
│   │   ├── Staff.ts
│   │   ├── Appointments.ts
│   │   └── Profiles.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Badge.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ServicesPreview.tsx
│   │   │   └── FeaturedProducts.tsx
│   │   ├── services/
│   │   │   └── ServiceCard.tsx
│   │   ├── shop/
│   │   │   ├── ProductCard.tsx
│   │   │   └── ProductModal.tsx
│   │   └── booking/
│   │       ├── BookingWizard.tsx          # Orchestrates multi-step flow
│   │       ├── StepServiceSelect.tsx
│   │       ├── StepDateTimePicker.tsx
│   │       ├── StepStaffSelect.tsx
│   │       └── StepContactInfo.tsx
│   ├── lib/
│   │   ├── payload.ts                     # Payload local API client
│   │   ├── auth.ts                        # NextAuth config
│   │   ├── resend.ts                      # Email helper
│   │   ├── twilio.ts                      # SMS helper
│   │   └── whatsapp.ts                    # WhatsApp deep-link generator
│   └── payload.config.ts                  # Payload root config
├── .env.local
├── tailwind.config.ts
├── next.config.ts
└── vercel.json                            # Cron job config
```

---

## Phase 1: Project Scaffold

### Task 1: Bootstrap Next.js + Payload CMS

**Files:**
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `.env.local`
- Create: `src/payload.config.ts`

- [ ] **Step 1: Initialize project**

```bash
cd "C:/Users/amuah/Projects"
npx create-next-app@latest "LUMIN MEDSPA" --typescript --tailwind --app --src-dir --no-git --import-alias "@/*"
cd "LUMIN MEDSPA"
```

- [ ] **Step 2: Install Payload CMS and adapters**

```bash
npm install payload@latest @payloadcms/next@latest @payloadcms/db-postgres@latest @payloadcms/richtext-lexical@latest
npm install @payloadcms/ui@latest
```

- [ ] **Step 3: Install auth, email, SMS, animations**

```bash
npm install next-auth@beta @auth/prisma-adapter
npm install resend
npm install twilio
npm install framer-motion
npm install @neondatabase/serverless
npm install sharp
npm install date-fns
```

- [ ] **Step 4: Create `.env.local`**

```bash
# C:/Users/amuah/Projects/LUMIN MEDSPA/.env.local
DATABASE_URI=postgresql://your-neon-connection-string
PAYLOAD_SECRET=replace-with-random-64-char-string

NEXTAUTH_SECRET=replace-with-random-64-char-string
NEXTAUTH_URL=http://localhost:3000

RESEND_API_KEY=re_replace_with_resend_key
RESEND_FROM_EMAIL=noreply@luminmedspa.com

TWILIO_ACCOUNT_SID=replace-with-twilio-sid
TWILIO_AUTH_TOKEN=replace-with-twilio-token
TWILIO_PHONE_NUMBER=+1replace_with_twilio_number

WHATSAPP_BUSINESS_NUMBER=+replace_with_wa_number

CRON_SECRET=replace-with-random-secret-for-cron-endpoint
```

- [ ] **Step 5: Configure `next.config.ts` for Payload**

```typescript
// next.config.ts
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default withPayload(nextConfig)
```

- [ ] **Step 6: Configure `tailwind.config.ts` with brand palette**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#F9F7F5',
        surface: '#FFFFFF',
        'text-primary': '#4A4A4A',
        blush: '#F4D1C5',
        'blush-deep': '#E8B8A8',
        border: '#E0DCD9',
        sage: '#8FA896',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        brand: '4px',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 7: Commit**

```bash
git init && git add . && git commit -m "feat: scaffold Next.js 16 + Payload CMS 3 project"
```

---

## Phase 2: Payload Collections (Database Schema)

### Task 2: Core Payload Collections

**Files:**
- Create: `src/collections/Users.ts`
- Create: `src/collections/Clients.ts`
- Create: `src/collections/Services.ts`
- Create: `src/collections/Products.ts`
- Create: `src/collections/Staff.ts`
- Create: `src/collections/Appointments.ts`
- Create: `src/collections/Profiles.ts`
- Create: `src/payload.config.ts`
- Create: `src/lib/payload.ts`

- [ ] **Step 1: Create `src/collections/Users.ts` (Payload admin users)**

```typescript
// src/collections/Users.ts
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'select', options: ['admin', 'staff'], defaultValue: 'staff' },
  ],
}
```

- [ ] **Step 2: Create `src/collections/Clients.ts` (client accounts for NextAuth)**

```typescript
// src/collections/Clients.ts
import type { CollectionConfig } from 'payload'

export const Clients: CollectionConfig = {
  slug: 'clients',
  admin: { useAsTitle: 'email', description: 'Customer accounts managed by NextAuth' },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'fullName', type: 'text', required: true },
    { name: 'phone', type: 'text' },
    { name: 'passwordHash', type: 'text', admin: { hidden: true } },
  ],
}
```

- [ ] **Step 3: Create `src/collections/Profiles.ts`**

```typescript
// src/collections/Profiles.ts
import type { CollectionConfig } from 'payload'

export const Profiles: CollectionConfig = {
  slug: 'profiles',
  admin: { useAsTitle: 'client', description: 'Personalized glow-up journey per client' },
  fields: [
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      required: true,
      unique: true,
    },
    {
      name: 'cosmeticNotes',
      type: 'richText',
      label: 'Cosmetic Recommendations (Admin Only)',
    },
    {
      name: 'practitionerComments',
      type: 'textarea',
      label: 'Skin Progression Notes',
    },
    {
      name: 'skinGoals',
      type: 'textarea',
      label: 'Skin Goals',
    },
    {
      name: 'recommendedProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: 'Recommended Products',
    },
  ],
}
```

- [ ] **Step 4: Create `src/collections/Services.ts`**

```typescript
// src/collections/Services.ts
import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'richText', required: true },
    { name: 'durationMinutes', type: 'number', required: true, min: 15 },
    { name: 'price', type: 'number', required: true, min: 0 },
    { name: 'imageUrl', type: 'text', label: 'Hero Image URL' },
    { name: 'benefits', type: 'array', fields: [{ name: 'benefit', type: 'text' }] },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
}
```

- [ ] **Step 5: Create `src/collections/Products.ts`**

```typescript
// src/collections/Products.ts
import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'price', type: 'number', required: true, min: 0 },
    { name: 'imageUrl', type: 'text', required: true, label: 'Product Image URL' },
    { name: 'category', type: 'select', options: ['moisturizer', 'serum', 'cleanser', 'spf', 'treatment', 'other'] },
    { name: 'isAvailable', type: 'checkbox', defaultValue: true },
  ],
}
```

- [ ] **Step 6: Create `src/collections/Staff.ts`**

```typescript
// src/collections/Staff.ts
import type { CollectionConfig } from 'payload'

export const Staff: CollectionConfig = {
  slug: 'staff',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true, label: 'Job Title' },
    { name: 'bio', type: 'textarea' },
    { name: 'avatarUrl', type: 'text', label: 'Avatar Image URL' },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      label: 'Offered Services',
    },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
}
```

- [ ] **Step 7: Create `src/collections/Appointments.ts`**

```typescript
// src/collections/Appointments.ts
import type { CollectionConfig } from 'payload'

export const Appointments: CollectionConfig = {
  slug: 'appointments',
  admin: { useAsTitle: 'id', description: 'Booking records' },
  fields: [
    { name: 'clientEmail', type: 'email', required: true },
    { name: 'clientName', type: 'text', required: true },
    { name: 'clientPhone', type: 'text', required: true },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      required: true,
    },
    {
      name: 'staff',
      type: 'relationship',
      relationTo: 'staff',
      required: true,
    },
    { name: 'startTime', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'endTime', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
    {
      name: 'status',
      type: 'select',
      options: ['scheduled', 'confirmed', 'completed', 'cancelled'],
      defaultValue: 'scheduled',
      required: true,
    },
    { name: 'reminderSent24h', type: 'checkbox', defaultValue: false, admin: { readOnly: true } },
    { name: 'reminderSent1h', type: 'checkbox', defaultValue: false, admin: { readOnly: true } },
    { name: 'confirmationSent', type: 'checkbox', defaultValue: false, admin: { readOnly: true } },
    { name: 'notes', type: 'textarea', label: 'Internal Notes' },
  ],
}
```

- [ ] **Step 8: Create `src/payload.config.ts`**

```typescript
// src/payload.config.ts
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { Users } from './collections/Users'
import { Clients } from './collections/Clients'
import { Services } from './collections/Services'
import { Products } from './collections/Products'
import { Staff } from './collections/Staff'
import { Appointments } from './collections/Appointments'
import { Profiles } from './collections/Profiles'
import { fileURLToPath } from 'url'
import path from 'path'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Lumin MedSpa Admin',
    },
  },
  collections: [Users, Clients, Services, Products, Staff, Appointments, Profiles],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '' },
  }),
  serverURL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
})
```

- [ ] **Step 9: Create `src/lib/payload.ts` (local API client)**

```typescript
// src/lib/payload.ts
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const getPayloadClient = async () => {
  return getPayload({ config: configPromise })
}
```

- [ ] **Step 10: Create Payload admin route**

Create `src/app/(payload)/admin/[[...segments]]/page.tsx`:
```typescript
export { RootPage as default } from '@payloadcms/next/views'
export { generateMetadata } from '@payloadcms/next/views'
```

Create `src/app/(payload)/admin/[[...segments]]/not-found.tsx`:
```typescript
export { NotFoundPage as default } from '@payloadcms/next/views'
```

Create `src/app/(payload)/layout.tsx`:
```typescript
import React from 'react'
export const dynamic = 'force-dynamic'
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 11: Verify Payload boots**

```bash
npm run dev
# Visit http://localhost:3000/admin
# Should show Payload create-first-user screen
```

- [ ] **Step 12: Commit**

```bash
git add -A && git commit -m "feat: add Payload CMS collections and admin route"
```

---

## Phase 3: Authentication (NextAuth v5)

### Task 3: NextAuth Setup

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/(frontend)/auth/signin/page.tsx`
- Create: `src/app/(frontend)/auth/register/page.tsx`

- [ ] **Step 1: Create `src/lib/auth.ts`**

```typescript
// src/lib/auth.ts
import NextAuth, { type NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { getPayloadClient } from './payload'
import bcrypt from 'bcryptjs'

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const payload = await getPayloadClient()
        const { docs } = await payload.find({
          collection: 'clients',
          where: { email: { equals: credentials.email } },
          limit: 1,
        })
        const client = docs[0]
        if (!client || !client.passwordHash) return null
        const valid = await bcrypt.compare(String(credentials.password), String(client.passwordHash))
        if (!valid) return null
        return { id: String(client.id), email: client.email, name: client.fullName }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/signin' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) session.user.id = String(token.id)
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
```

- [ ] **Step 2: Install bcryptjs**

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **Step 3: Create `src/app/api/auth/[...nextauth]/route.ts`**

```typescript
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

- [ ] **Step 4: Create `src/app/api/register/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { email, password, fullName, phone } = await req.json()
  if (!email || !password || !fullName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  const payload = await getPayloadClient()
  const existing = await payload.find({ collection: 'clients', where: { email: { equals: email } } })
  if (existing.docs.length > 0) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }
  const passwordHash = await bcrypt.hash(password, 12)
  const client = await payload.create({
    collection: 'clients',
    data: { email, fullName, phone, passwordHash },
  })
  await payload.create({
    collection: 'profiles',
    data: { client: client.id },
  })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add NextAuth v5 credentials auth + registration endpoint"
```

---

## Phase 4: Global Layout + Brand UI Components

### Task 4: Root Layout, Navbar, Footer

**Files:**
- Create: `src/app/(frontend)/layout.tsx`
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/app/(frontend)/globals.css` (or `src/app/globals.css`)

- [ ] **Step 1: Create brand globals.css (add to existing src/app/globals.css)**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #F9F7F5;
  --surface: #FFFFFF;
  --text-primary: #4A4A4A;
  --blush: #F4D1C5;
  --blush-deep: #E8B8A8;
  --border: #E0DCD9;
  --sage: #8FA896;
}

body {
  background-color: var(--background);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}

* {
  box-sizing: border-box;
}
```

- [ ] **Step 2: Create `src/components/ui/Button.tsx`**

```typescript
// src/components/ui/Button.tsx
'use client'
import { motion } from 'framer-motion'
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium tracking-[0.05em] uppercase text-sm rounded-brand transition-colors duration-200 disabled:opacity-50 cursor-pointer'
    const variants = {
      primary: 'bg-blush hover:bg-blush-deep text-text-primary',
      secondary: 'bg-surface border border-border hover:border-blush text-text-primary',
      outline: 'border border-blush text-text-primary hover:bg-blush/20',
      ghost: 'text-text-primary hover:bg-border/40',
    }
    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3',
      lg: 'px-8 py-4 text-base',
    }
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(base, variants[variant], sizes[size], className)}
        {...(props as any)}
      >
        {children}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'
```

- [ ] **Step 3: Create `src/lib/utils.ts`**

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 4: Create `src/components/ui/Input.tsx`**

```typescript
// src/components/ui/Input.tsx
import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 border border-border rounded-brand bg-surface text-text-primary text-[16px]',
          'focus:outline-none focus:border-blush transition-colors duration-200',
          'placeholder:text-border',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
)
Input.displayName = 'Input'
```

- [ ] **Step 5: Create `src/components/layout/Navbar.tsx`**

```typescript
// src/components/layout/Navbar.tsx
'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 20))

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/95 backdrop-blur-sm border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-[-0.02em] text-text-primary">
          LUMIN
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/services" className="text-sm text-text-primary/70 hover:text-text-primary transition-colors">Services</Link>
          <Link href="/shop" className="text-sm text-text-primary/70 hover:text-text-primary transition-colors">Shop</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm text-text-primary/70 hover:text-text-primary transition-colors">My Account</Link>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link href="/booking"><Button variant="primary" size="sm">Book Now</Button></Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
```

- [ ] **Step 6: Create `src/components/layout/Footer.tsx`**

```typescript
// src/components/layout/Footer.tsx
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="text-xl font-bold tracking-[-0.02em] mb-3">LUMIN</p>
          <p className="text-sm text-text-primary/60 leading-relaxed max-w-xs">
            Non-invasive skin rejuvenation treatments designed to give you your ultimate glow up.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.05em] mb-4 text-text-primary/50">Quick Links</p>
          <ul className="space-y-2">
            {[['Services', '/services'], ['Shop', '/shop'], ['Book Appointment', '/booking']].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-sm text-text-primary/70 hover:text-text-primary transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.05em] mb-4 text-text-primary/50">Contact</p>
          <p className="text-sm text-text-primary/60">hello@luminmedspa.com</p>
          <p className="text-sm text-text-primary/60 mt-1">+1 (000) 000-0000</p>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="text-center text-xs text-text-primary/40 py-4">
          © {new Date().getFullYear()} Lumin MedSpa. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 7: Create `src/app/(frontend)/layout.tsx`**

```typescript
// src/app/(frontend)/layout.tsx
import { SessionProvider } from 'next-auth/react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lumin MedSpa | Your Glow Up Awaits',
  description: 'Non-invasive skin rejuvenation treatments and premium cosmetics.',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
    </SessionProvider>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: global layout, navbar, footer, and brand UI primitives"
```

---

## Phase 5: Homepage

### Task 5: Hero + Sections

**Files:**
- Create: `src/app/(frontend)/page.tsx`
- Create: `src/components/home/HeroSection.tsx`
- Create: `src/components/home/ServicesPreview.tsx`
- Create: `src/components/home/FeaturedProducts.tsx`

- [ ] **Step 1: Create `src/components/home/HeroSection.tsx`**

```typescript
// src/components/home/HeroSection.tsx
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background">
      {/* Glow radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(244,209,197,0.25) 0%, transparent 70%)' }}
      />
      <div className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs font-medium uppercase tracking-[0.1em] text-blush-deep mb-6 block"
          >
            Non-Invasive Skin Rejuvenation
          </motion.span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-[-0.02em] text-text-primary leading-tight mb-6">
            Your<br />
            <span className="relative inline-block">
              Glow Up
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blush"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              />
            </span>
            <br />Starts Here.
          </h1>
          <p className="text-lg text-text-primary/60 leading-relaxed mb-10 max-w-md">
            Science-backed, non-invasive treatments designed to restore, refresh, and reveal your most radiant skin — with zero downtime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/booking">
              <Button variant="primary" size="lg">Book Your Glow Up</Button>
            </Link>
            <Link href="/services">
              <Button variant="secondary" size="lg">Explore Services</Button>
            </Link>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          className="relative"
        >
          <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-blush/20 border border-border">
            {/* Placeholder — replace with actual hero image */}
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-20">✦</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 bg-surface border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-text-primary/50 uppercase tracking-[0.05em]">Results in</p>
            <p className="text-2xl font-bold text-text-primary">1 Session</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `src/components/home/ServicesPreview.tsx`**

```typescript
// src/components/home/ServicesPreview.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { getPayloadClient } from '@/lib/payload'

export async function ServicesPreview() {
  const payload = await getPayloadClient()
  const { docs: services } = await payload.find({
    collection: 'services',
    where: { isActive: { equals: true } },
    limit: 3,
  })

  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.1em] text-blush-deep block mb-3">What We Offer</span>
            <h2 className="text-4xl font-semibold tracking-[-0.02em] text-text-primary">Our Treatments</h2>
          </div>
          <Link href="/services"><Button variant="outline">View All Services</Button></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.length === 0 ? (
            <p className="text-text-primary/50 col-span-3 text-center py-12">Services coming soon.</p>
          ) : services.map((service) => (
            <div key={service.id} className="bg-surface border border-border rounded-xl p-6 hover:border-blush transition-colors duration-200">
              <div className="w-10 h-10 rounded-full bg-blush/30 mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">{service.name}</h3>
              <p className="text-sm text-text-primary/60 leading-relaxed mb-4 line-clamp-3">
                {typeof service.description === 'string' ? service.description : 'Premium non-invasive treatment.'}
              </p>
              <p className="text-sm font-medium text-text-primary">${service.price} · {service.durationMinutes} min</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `src/components/home/FeaturedProducts.tsx`**

```typescript
// src/components/home/FeaturedProducts.tsx
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { getPayloadClient } from '@/lib/payload'
import { generateWhatsAppLink } from '@/lib/whatsapp'

export async function FeaturedProducts() {
  const payload = await getPayloadClient()
  const { docs: products } = await payload.find({
    collection: 'products',
    where: { isAvailable: { equals: true } },
    limit: 3,
  })

  return (
    <section className="py-24 bg-surface/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.1em] text-blush-deep block mb-3">Curated For You</span>
            <h2 className="text-4xl font-semibold tracking-[-0.02em] text-text-primary">Shop The Glow</h2>
          </div>
          <Link href="/shop"><Button variant="outline">View All Products</Button></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-surface border border-border rounded-xl overflow-hidden group hover:border-blush transition-colors duration-200">
              <div className="aspect-square bg-blush/10 relative overflow-hidden">
                {product.imageUrl ? (
                  <Image src={product.imageUrl as string} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">✦</div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-medium text-text-primary mb-1">{product.name}</h3>
                <p className="text-sm text-text-primary/60 mb-4">${product.price}</p>
                <a href={generateWhatsAppLink(product.name, String(product.price))} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm" className="w-full">Order via WhatsApp</Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create `src/lib/whatsapp.ts`**

```typescript
// src/lib/whatsapp.ts
export function generateWhatsAppLink(productName: string, price: string, userName?: string): string {
  const number = process.env.WHATSAPP_BUSINESS_NUMBER?.replace(/\D/g, '') || ''
  const message = encodeURIComponent(
    `Hi Lumin MedSpa! I'd like to order:\n\n*${productName}* — $${price}${userName ? `\n\nName: ${userName}` : ''}\n\nPlease let me know how to proceed. Thank you!`
  )
  return `https://wa.me/${number}?text=${message}`
}
```

- [ ] **Step 5: Create `src/app/(frontend)/page.tsx`**

```typescript
// src/app/(frontend)/page.tsx
import { HeroSection } from '@/components/home/HeroSection'
import { ServicesPreview } from '@/components/home/ServicesPreview'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesPreview />
      <FeaturedProducts />
    </>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: homepage with hero, services preview, and featured products"
```

---

## Phase 6: Services & Shop Pages

### Task 6: Services Listing

**Files:**
- Create: `src/app/(frontend)/services/page.tsx`
- Create: `src/components/services/ServiceCard.tsx`

- [ ] **Step 1: Create `src/components/services/ServiceCard.tsx`**

```typescript
// src/components/services/ServiceCard.tsx
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import type { Service } from '@/payload-types'

export function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-surface border border-border rounded-xl p-8 hover:border-blush transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-full bg-blush/30 group-hover:bg-blush/50 transition-colors" />
        <span className="text-xs font-medium uppercase tracking-[0.05em] text-text-primary/40">
          {service.durationMinutes} min
        </span>
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-3">{service.name}</h3>
      <p className="text-sm text-text-primary/60 leading-relaxed mb-6 line-clamp-4">
        {typeof service.description === 'string' ? service.description : 'Premium treatment.'}
      </p>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-lg font-semibold text-text-primary">${service.price}</span>
        <Link href={`/booking?service=${service.id}`}>
          <Button variant="primary" size="sm">Book Now</Button>
        </Link>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Create `src/app/(frontend)/services/page.tsx`**

```typescript
// src/app/(frontend)/services/page.tsx
import { getPayloadClient } from '@/lib/payload'
import { ServiceCard } from '@/components/services/ServiceCard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Services | Lumin MedSpa' }

export default async function ServicesPage() {
  const payload = await getPayloadClient()
  const { docs: services } = await payload.find({
    collection: 'services',
    where: { isActive: { equals: true } },
    limit: 50,
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <span className="text-xs font-medium uppercase tracking-[0.1em] text-blush-deep block mb-4">Our Treatments</span>
          <h1 className="text-5xl font-bold tracking-[-0.02em] text-text-primary mb-4">Non-Invasive Glow Treatments</h1>
          <p className="text-lg text-text-primary/60 leading-relaxed">
            Science-backed procedures with zero downtime, designed for busy professionals who demand results.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service as any} index={i} />
          ))}
          {services.length === 0 && (
            <p className="col-span-3 text-center text-text-primary/50 py-20">Services coming soon.</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

### Task 7: Shop Page

**Files:**
- Create: `src/app/(frontend)/shop/page.tsx`
- Create: `src/components/shop/ProductCard.tsx`
- Create: `src/components/shop/ProductModal.tsx`

- [ ] **Step 1: Create `src/components/shop/ProductCard.tsx`**

```typescript
// src/components/shop/ProductCard.tsx
'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { generateWhatsAppLink } from '@/lib/whatsapp'
import { useState } from 'react'
import { ProductModal } from './ProductModal'
import type { Product } from '@/payload-types'

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.07, duration: 0.5 }}
        className="bg-surface border border-border rounded-xl overflow-hidden group hover:border-blush transition-all duration-200"
      >
        <div
          className="aspect-square bg-blush/10 relative overflow-hidden cursor-pointer"
          onClick={() => setOpen(true)}
        >
          {product.imageUrl ? (
            <Image src={product.imageUrl as string} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">✦</div>
          )}
        </div>
        <div className="p-5">
          <button onClick={() => setOpen(true)} className="text-left w-full">
            <h3 className="font-medium text-text-primary hover:text-blush-deep transition-colors">{product.name}</h3>
            <p className="text-xs text-text-primary/50 capitalize mt-0.5">{product.category}</p>
          </button>
          <div className="flex items-center justify-between mt-4">
            <span className="text-lg font-semibold text-text-primary">${product.price}</span>
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
```

- [ ] **Step 2: Create `src/components/shop/ProductModal.tsx`**

```typescript
// src/components/shop/ProductModal.tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { generateWhatsAppLink } from '@/lib/whatsapp'
import type { Product } from '@/payload-types'

export function ProductModal({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative bg-surface rounded-2xl overflow-hidden max-w-lg w-full shadow-xl border border-border"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="aspect-video bg-blush/10 relative">
              {product.imageUrl ? (
                <Image src={product.imageUrl as string} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">✦</div>
              )}
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-text-primary mb-2">{product.name}</h2>
              <p className="text-sm text-text-primary/60 leading-relaxed mb-6">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-text-primary">${product.price}</span>
                <a href={generateWhatsAppLink(product.name, String(product.price))} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary">Order via WhatsApp</Button>
                </a>
              </div>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface/80 text-text-primary hover:bg-border transition-colors">✕</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Create `src/app/(frontend)/shop/page.tsx`**

```typescript
// src/app/(frontend)/shop/page.tsx
import { getPayloadClient } from '@/lib/payload'
import { ProductCard } from '@/components/shop/ProductCard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Shop | Lumin MedSpa' }

export default async function ShopPage() {
  const payload = await getPayloadClient()
  const { docs: products } = await payload.find({
    collection: 'products',
    where: { isAvailable: { equals: true } },
    limit: 50,
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <span className="text-xs font-medium uppercase tracking-[0.1em] text-blush-deep block mb-4">Shop The Glow</span>
          <h1 className="text-5xl font-bold tracking-[-0.02em] text-text-primary mb-4">Curated Cosmetics</h1>
          <p className="text-lg text-text-primary/60 leading-relaxed">
            Professionally selected skincare and cosmetics to extend your glow between treatments.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product as any} index={i} />
          ))}
          {products.length === 0 && (
            <p className="col-span-4 text-center text-text-primary/50 py-20">Products coming soon.</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: services listing page and shop with WhatsApp integration"
```

---

## Phase 7: Booking System

### Task 8: Booking API + Wizard UI

**Files:**
- Create: `src/app/api/booking/route.ts`
- Create: `src/app/api/booking/availability/route.ts`
- Create: `src/app/(frontend)/booking/page.tsx`
- Create: `src/components/booking/BookingWizard.tsx`
- Create: `src/components/booking/StepServiceSelect.tsx`
- Create: `src/components/booking/StepDateTimePicker.tsx`
- Create: `src/components/booking/StepStaffSelect.tsx`
- Create: `src/components/booking/StepContactInfo.tsx`
- Create: `src/app/(frontend)/booking/confirmation/page.tsx`
- Create: `src/lib/resend.ts`
- Create: `src/lib/twilio.ts`

- [ ] **Step 1: Create `src/lib/resend.ts`**

```typescript
// src/lib/resend.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBookingConfirmation(to: string, name: string, service: string, dateTime: string) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@luminmedspa.com',
    to,
    subject: 'Your Lumin MedSpa Appointment is Confirmed ✦',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; color: #4A4A4A;">
        <div style="background: #F9F7F5; padding: 40px; border-radius: 8px;">
          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Glow Secured, ${name}.</h1>
          <p style="color: #888; margin-bottom: 24px;">Your appointment has been confirmed.</p>
          <div style="background: #FFFFFF; border: 1px solid #E0DCD9; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Date & Time:</strong> ${dateTime}</p>
          </div>
          <p style="color: #888; font-size: 14px;">Need to reschedule? Reply to this email or contact us.</p>
        </div>
      </div>
    `,
  })
}

export async function sendAppointmentReminder(to: string, name: string, service: string, dateTime: string, isOneHour = false) {
  const subject = isOneHour
    ? 'Get Ready for Your Glow Up — 1 Hour Away ✦'
    : 'Your Lumin Appointment is Tomorrow ✦'
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@luminmedspa.com',
    to,
    subject,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; color: #4A4A4A;">
        <div style="background: #F9F7F5; padding: 40px; border-radius: 8px;">
          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
            ${isOneHour ? 'See you soon, ' : 'Almost time, '}${name}!
          </h1>
          <p style="color: #888; margin-bottom: 24px;">${isOneHour ? 'Your glow up is in 1 hour.' : 'Your appointment is tomorrow.'}</p>
          <div style="background: #FFFFFF; border: 1px solid #E0DCD9; border-radius: 8px; padding: 24px;">
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Date & Time:</strong> ${dateTime}</p>
          </div>
        </div>
      </div>
    `,
  })
}
```

- [ ] **Step 2: Create `src/lib/twilio.ts`**

```typescript
// src/lib/twilio.ts
import twilio from 'twilio'

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function sendSMS(to: string, body: string) {
  await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  })
}

export async function sendBookingConfirmationSMS(to: string, name: string, service: string, dateTime: string) {
  await sendSMS(to, `Lumin MedSpa ✦ Hi ${name}, your ${service} appointment on ${dateTime} is confirmed. See you soon!`)
}

export async function sendReminderSMS(to: string, name: string, service: string, dateTime: string, isOneHour = false) {
  const msg = isOneHour
    ? `Lumin MedSpa ✦ Get ready, ${name}! Your ${service} is in 1 hour at ${dateTime}.`
    : `Lumin MedSpa ✦ Reminder: Your ${service} is tomorrow at ${dateTime}. See you then!`
  await sendSMS(to, msg)
}
```

- [ ] **Step 3: Create `src/app/api/booking/availability/route.ts`**

```typescript
// src/app/api/booking/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { addMinutes, format, parseISO, setHours, setMinutes, isBefore, isAfter } from 'date-fns'

const BUSINESS_START = 9  // 9 AM
const BUSINESS_END = 18   // 6 PM
const SLOT_INTERVAL = 30  // minutes

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const staffId = searchParams.get('staffId')
  const dateStr = searchParams.get('date')

  if (!staffId || !dateStr) {
    return NextResponse.json({ error: 'staffId and date required' }, { status: 400 })
  }

  const date = parseISO(dateStr)
  const dayStart = setMinutes(setHours(date, BUSINESS_START), 0)
  const dayEnd = setMinutes(setHours(date, BUSINESS_END), 0)

  const payload = await getPayloadClient()
  const { docs: existing } = await payload.find({
    collection: 'appointments',
    where: {
      staff: { equals: staffId },
      status: { not_equals: 'cancelled' },
      startTime: { greater_than_equal: dayStart.toISOString() },
      endTime: { less_than_equal: dayEnd.toISOString() },
    },
    limit: 100,
  })

  const slots: string[] = []
  let cursor = dayStart
  while (isBefore(cursor, dayEnd)) {
    const slotEnd = addMinutes(cursor, SLOT_INTERVAL)
    const busy = existing.some((appt) => {
      const s = parseISO(String(appt.startTime))
      const e = parseISO(String(appt.endTime))
      return isBefore(cursor, e) && isAfter(slotEnd, s)
    })
    if (!busy) slots.push(cursor.toISOString())
    cursor = slotEnd
  }

  return NextResponse.json({ slots })
}
```

- [ ] **Step 4: Create `src/app/api/booking/route.ts`**

```typescript
// src/app/api/booking/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { addMinutes, format } from 'date-fns'
import { sendBookingConfirmation, sendAppointmentReminder } from '@/lib/resend'
import { sendBookingConfirmationSMS } from '@/lib/twilio'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { serviceId, staffId, startTime, clientName, clientEmail, clientPhone } = body

  if (!serviceId || !staffId || !startTime || !clientName || !clientEmail || !clientPhone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const payload = await getPayloadClient()

  const service = await payload.findByID({ collection: 'services', id: serviceId })
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

  const endTime = addMinutes(new Date(startTime), service.durationMinutes as number)

  const appointment = await payload.create({
    collection: 'appointments',
    data: {
      clientName,
      clientEmail,
      clientPhone,
      service: serviceId,
      staff: staffId,
      startTime,
      endTime: endTime.toISOString(),
      status: 'scheduled',
    },
  })

  const formattedDate = format(new Date(startTime), 'MMMM d, yyyy \'at\' h:mm a')

  // Fire confirmation notifications (don't await — non-blocking)
  Promise.all([
    sendBookingConfirmation(clientEmail, clientName, service.name as string, formattedDate),
    sendBookingConfirmationSMS(clientPhone, clientName, service.name as string, formattedDate),
    payload.update({ collection: 'appointments', id: appointment.id, data: { confirmationSent: true } }),
  ]).catch(console.error)

  return NextResponse.json({ success: true, appointmentId: appointment.id })
}
```

- [ ] **Step 5: Create `src/components/booking/BookingWizard.tsx`**

```typescript
// src/components/booking/BookingWizard.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StepServiceSelect } from './StepServiceSelect'
import { StepStaffSelect } from './StepStaffSelect'
import { StepDateTimePicker } from './StepDateTimePicker'
import { StepContactInfo } from './StepContactInfo'
import { motion, AnimatePresence } from 'framer-motion'

export type BookingState = {
  serviceId: string
  serviceName: string
  staffId: string
  staffName: string
  startTime: string
  clientName: string
  clientEmail: string
  clientPhone: string
}

const STEPS = ['Service', 'Staff', 'Date & Time', 'Your Details']

export function BookingWizard({ preselectedServiceId }: { preselectedServiceId?: string }) {
  const [step, setStep] = useState(preselectedServiceId ? 1 : 0)
  const [booking, setBooking] = useState<Partial<BookingState>>({
    serviceId: preselectedServiceId,
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const next = (data: Partial<BookingState>) => {
    setBooking((prev) => ({ ...prev, ...data }))
    setStep((s) => s + 1)
  }
  const back = () => setStep((s) => s - 1)

  const submit = async (contactData: { clientName: string; clientEmail: string; clientPhone: string }) => {
    setLoading(true)
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...booking, ...contactData }),
      })
      if (!res.ok) throw new Error('Booking failed')
      router.push('/booking/confirmation')
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${i <= step ? 'bg-blush text-text-primary' : 'bg-border text-text-primary/40'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i <= step ? 'text-text-primary' : 'text-text-primary/40'}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-blush' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {step === 0 && <StepServiceSelect onNext={(s) => next({ serviceId: s.id, serviceName: s.name })} />}
          {step === 1 && <StepStaffSelect serviceId={booking.serviceId!} onNext={(s) => next({ staffId: s.id, staffName: s.name })} onBack={back} />}
          {step === 2 && <StepDateTimePicker staffId={booking.staffId!} onNext={(t) => next({ startTime: t })} onBack={back} />}
          {step === 3 && <StepContactInfo onSubmit={submit} onBack={back} loading={loading} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 6: Create `src/components/booking/StepServiceSelect.tsx`**

```typescript
// src/components/booking/StepServiceSelect.tsx
'use client'
import { useEffect, useState } from 'react'

type ServiceOption = { id: string; name: string; price: number; durationMinutes: number; description: string }

export function StepServiceSelect({ onNext }: { onNext: (s: { id: string; name: string }) => void }) {
  const [services, setServices] = useState<ServiceOption[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(d => setServices(d.services || []))
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-semibold text-text-primary mb-2">Choose Your Treatment</h2>
      <p className="text-text-primary/60 mb-8">Select the service you'd like to book.</p>
      <div className="grid gap-4">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className={`text-left p-5 rounded-xl border transition-all ${selected === s.id ? 'border-blush bg-blush/5' : 'border-border bg-surface hover:border-blush/50'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-text-primary">{s.name}</p>
                <p className="text-sm text-text-primary/60 mt-1 line-clamp-2">{s.description}</p>
              </div>
              <div className="text-right ml-4 shrink-0">
                <p className="font-semibold text-text-primary">${s.price}</p>
                <p className="text-xs text-text-primary/50">{s.durationMinutes} min</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <button
        disabled={!selected}
        onClick={() => { const s = services.find(s => s.id === selected)!; onNext({ id: s.id, name: s.name }) }}
        className="mt-8 w-full py-3 rounded-brand bg-blush hover:bg-blush-deep disabled:opacity-40 font-medium tracking-[0.05em] uppercase text-sm transition-colors"
      >
        Continue
      </button>
    </div>
  )
}
```

- [ ] **Step 7: Create services API route**

Create `src/app/api/services/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function GET() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'services', where: { isActive: { equals: true } } })
  return NextResponse.json({ services: docs.map(s => ({
    id: s.id,
    name: s.name,
    price: s.price,
    durationMinutes: s.durationMinutes,
    description: typeof s.description === 'string' ? s.description : '',
  })) })
}
```

- [ ] **Step 8: Create staff API route**

Create `src/app/api/staff/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const serviceId = searchParams.get('serviceId')
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'staff',
    where: { isActive: { equals: true } },
    limit: 50,
  })
  const filtered = serviceId
    ? docs.filter(s => Array.isArray(s.services) && s.services.some((sv: any) => (typeof sv === 'string' ? sv : sv.id) === serviceId))
    : docs
  return NextResponse.json({ staff: filtered.map(s => ({ id: s.id, name: s.name, role: s.role, bio: s.bio, avatarUrl: s.avatarUrl })) })
}
```

- [ ] **Step 9: Create `src/components/booking/StepStaffSelect.tsx`**

```typescript
// src/components/booking/StepStaffSelect.tsx
'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'

type StaffOption = { id: string; name: string; role: string; bio: string }

export function StepStaffSelect({ serviceId, onNext, onBack }: { serviceId: string; onNext: (s: { id: string; name: string }) => void; onBack: () => void }) {
  const [staff, setStaff] = useState<StaffOption[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/staff?serviceId=${serviceId}`).then(r => r.json()).then(d => setStaff(d.staff || []))
  }, [serviceId])

  return (
    <div>
      <h2 className="text-2xl font-semibold text-text-primary mb-2">Choose Your Specialist</h2>
      <p className="text-text-primary/60 mb-8">Select who you'd like to see for this treatment.</p>
      <div className="grid gap-4">
        {staff.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className={`text-left p-5 rounded-xl border flex items-center gap-4 transition-all ${selected === s.id ? 'border-blush bg-blush/5' : 'border-border bg-surface hover:border-blush/50'}`}
          >
            <div className="w-12 h-12 rounded-full bg-blush/30 shrink-0 flex items-center justify-center font-semibold text-text-primary">
              {s.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-text-primary">{s.name}</p>
              <p className="text-sm text-text-primary/60">{s.role}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="flex gap-3 mt-8">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <button
          disabled={!selected}
          onClick={() => { const s = staff.find(s => s.id === selected)!; onNext({ id: s.id, name: s.name }) }}
          className="flex-1 py-3 rounded-brand bg-blush hover:bg-blush-deep disabled:opacity-40 font-medium tracking-[0.05em] uppercase text-sm transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 10: Create `src/components/booking/StepDateTimePicker.tsx`**

```typescript
// src/components/booking/StepDateTimePicker.tsx
'use client'
import { useState, useEffect } from 'react'
import { format, addDays, isBefore, startOfToday, parseISO } from 'date-fns'
import { Button } from '@/components/ui/Button'

export function StepDateTimePicker({ staffId, onNext, onBack }: { staffId: string; onNext: (t: string) => void; onBack: () => void }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const today = startOfToday()
  const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i + 1))

  useEffect(() => {
    if (!selectedDate) return
    setSlots([])
    setSelectedSlot(null)
    const d = format(selectedDate, 'yyyy-MM-dd')
    fetch(`/api/booking/availability?staffId=${staffId}&date=${d}`)
      .then(r => r.json())
      .then(d => setSlots(d.slots || []))
  }, [selectedDate, staffId])

  return (
    <div>
      <h2 className="text-2xl font-semibold text-text-primary mb-2">Pick a Date & Time</h2>
      <p className="text-text-primary/60 mb-6">Choose from available slots.</p>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {dates.map((d) => (
          <button
            key={d.toISOString()}
            onClick={() => setSelectedDate(d)}
            className={`shrink-0 px-4 py-3 rounded-xl border text-center transition-all ${selectedDate?.toDateString() === d.toDateString() ? 'border-blush bg-blush/10' : 'border-border bg-surface hover:border-blush/50'}`}
          >
            <p className="text-xs text-text-primary/50">{format(d, 'EEE')}</p>
            <p className="font-semibold text-text-primary">{format(d, 'd')}</p>
          </button>
        ))}
      </div>
      {selectedDate && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
          {slots.length === 0 && <p className="col-span-4 text-center text-text-primary/50 py-6">No slots available.</p>}
          {slots.map((slot) => (
            <button
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${selectedSlot === slot ? 'border-blush bg-blush/10 text-text-primary' : 'border-border bg-surface hover:border-blush/50 text-text-primary/70'}`}
            >
              {format(parseISO(slot), 'h:mm a')}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-3 mt-4">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <button
          disabled={!selectedSlot}
          onClick={() => onNext(selectedSlot!)}
          className="flex-1 py-3 rounded-brand bg-blush hover:bg-blush-deep disabled:opacity-40 font-medium tracking-[0.05em] uppercase text-sm transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 11: Create `src/components/booking/StepContactInfo.tsx`**

```typescript
// src/components/booking/StepContactInfo.tsx
'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type ContactData = { clientName: string; clientEmail: string; clientPhone: string }

export function StepContactInfo({ onSubmit, onBack, loading }: { onSubmit: (d: ContactData) => void; onBack: () => void; loading: boolean }) {
  const [form, setForm] = useState<ContactData>({ clientName: '', clientEmail: '', clientPhone: '' })
  const [errors, setErrors] = useState<Partial<ContactData>>({})

  const validate = () => {
    const e: Partial<ContactData> = {}
    if (!form.clientName.trim()) e.clientName = 'Name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.clientEmail)) e.clientEmail = 'Valid email required'
    if (!form.clientPhone.trim()) e.clientPhone = 'Phone is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-text-primary mb-2">Your Details</h2>
      <p className="text-text-primary/60 mb-8">We'll send your confirmation to these contacts.</p>
      <div className="flex flex-col gap-5">
        <Input label="Full Name" value={form.clientName} onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))} error={errors.clientName} placeholder="Jane Doe" />
        <Input label="Email Address" type="email" value={form.clientEmail} onChange={e => setForm(p => ({ ...p, clientEmail: e.target.value }))} error={errors.clientEmail} placeholder="jane@email.com" />
        <Input label="Phone Number" type="tel" value={form.clientPhone} onChange={e => setForm(p => ({ ...p, clientPhone: e.target.value }))} error={errors.clientPhone} placeholder="+1 555 000 0000" />
      </div>
      <div className="flex gap-3 mt-8">
        <Button variant="secondary" onClick={onBack} className="flex-1" disabled={loading}>Back</Button>
        <button
          onClick={() => { if (validate()) onSubmit(form) }}
          disabled={loading}
          className="flex-1 py-3 rounded-brand bg-blush hover:bg-blush-deep disabled:opacity-40 font-medium tracking-[0.05em] uppercase text-sm transition-colors"
        >
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 12: Create booking pages**

Create `src/app/(frontend)/booking/page.tsx`:
```typescript
import { BookingWizard } from '@/components/booking/BookingWizard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Book Your Glow Up | Lumin MedSpa' }

export default function BookingPage({ searchParams }: { searchParams: { service?: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="text-xs font-medium uppercase tracking-[0.1em] text-blush-deep block mb-4">Book Online</span>
          <h1 className="text-5xl font-bold tracking-[-0.02em] text-text-primary mb-4">Book Your Glow Up</h1>
          <p className="text-lg text-text-primary/60">No deposit required. Confirmation sent instantly.</p>
        </div>
        <BookingWizard preselectedServiceId={searchParams.service} />
      </div>
    </div>
  )
}
```

Create `src/app/(frontend)/booking/confirmation/page.tsx`:
```typescript
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-full bg-blush/30 flex items-center justify-center mx-auto mb-8 text-3xl">✦</div>
        <h1 className="text-4xl font-bold tracking-[-0.02em] text-text-primary mb-4">Glow Secured.</h1>
        <p className="text-text-primary/60 leading-relaxed mb-8">
          Your appointment has been confirmed. Check your email and phone for details.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/auth/signin"><Button variant="primary" className="w-full">Track in My Account</Button></Link>
          <Link href="/"><Button variant="secondary" className="w-full">Back to Home</Button></Link>
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 13: Commit**

```bash
git add -A && git commit -m "feat: full booking wizard with availability API and confirmation flow"
```

---

## Phase 8: Client Dashboard

### Task 9: Auth Pages + Profile Dashboard

**Files:**
- Create: `src/app/(frontend)/auth/signin/page.tsx`
- Create: `src/app/(frontend)/auth/register/page.tsx`
- Create: `src/app/(frontend)/dashboard/page.tsx`
- Create: `src/app/api/dashboard/route.ts`

- [ ] **Step 1: Create `src/app/(frontend)/auth/signin/page.tsx`**

```typescript
'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function SignInPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await signIn('credentials', { ...form, redirect: false })
    if (res?.error) { setError('Invalid email or password'); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-text-primary mb-2">Welcome Back</h1>
          <p className="text-text-primary/60">Sign in to manage your appointments.</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            <Input label="Password" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" variant="primary" disabled={loading} className="w-full mt-2">
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <p className="text-center text-sm text-text-primary/60 mt-6">
            Don't have an account? <Link href="/auth/register" className="text-blush-deep hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/(frontend)/auth/register/page.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Registration failed'); setLoading(false); return }
    await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-text-primary mb-2">Start Your Glow Up</h1>
          <p className="text-text-primary/60">Create your account to track your journey.</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input label="Full Name" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            <Input label="Phone" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
            <Input label="Password" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" variant="primary" disabled={loading} className="w-full mt-2">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <p className="text-center text-sm text-text-primary/60 mt-6">
            Already have an account? <Link href="/auth/signin" className="text-blush-deep hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/app/api/dashboard/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = await getPayloadClient()

  const { docs: appointments } = await payload.find({
    collection: 'appointments',
    where: { clientEmail: { equals: session.user.email } },
    sort: '-startTime',
    limit: 20,
    depth: 2,
  })

  const { docs: clients } = await payload.find({
    collection: 'clients',
    where: { email: { equals: session.user.email } },
    limit: 1,
  })

  let profile = null
  if (clients[0]) {
    const { docs: profiles } = await payload.find({
      collection: 'profiles',
      where: { client: { equals: clients[0].id } },
      limit: 1,
      depth: 2,
    })
    profile = profiles[0] || null
  }

  return NextResponse.json({ appointments, profile })
}
```

- [ ] **Step 4: Create `src/app/(frontend)/dashboard/page.tsx`**

```typescript
// src/app/(frontend)/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { format, parseISO } from 'date-fns'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Account | Lumin MedSpa' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/auth/signin')

  const payload = await getPayloadClient()

  const { docs: appointments } = await payload.find({
    collection: 'appointments',
    where: { clientEmail: { equals: session.user.email } },
    sort: 'startTime',
    limit: 20,
    depth: 2,
  })

  const { docs: clients } = await payload.find({
    collection: 'clients',
    where: { email: { equals: session.user.email } },
    limit: 1,
  })

  let profile: any = null
  if (clients[0]) {
    const { docs: profiles } = await payload.find({
      collection: 'profiles',
      where: { client: { equals: clients[0].id } },
      depth: 2,
      limit: 1,
    })
    profile = profiles[0] || null
  }

  const upcoming = appointments.filter((a) => a.status === 'scheduled' || a.status === 'confirmed')
  const past = appointments.filter((a) => a.status === 'completed')

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-[-0.02em] text-text-primary mb-2">
            Welcome, {session.user.name?.split(' ')[0]}.
          </h1>
          <p className="text-text-primary/60">Your glow up journey at a glance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <section className="md:col-span-2">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Upcoming Appointments</h2>
            {upcoming.length === 0 ? (
              <div className="bg-surface border border-border rounded-xl p-8 text-center">
                <p className="text-text-primary/50 mb-4">No upcoming appointments.</p>
                <a href="/booking" className="text-sm text-blush-deep hover:underline">Book your next glow up →</a>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {upcoming.map((appt) => (
                  <div key={appt.id} className="bg-surface border border-border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-text-primary">{typeof appt.service === 'object' ? (appt.service as any).name : 'Service'}</p>
                      <p className="text-sm text-text-primary/60 mt-1">
                        {format(parseISO(String(appt.startTime)), 'MMMM d, yyyy \'at\' h:mm a')}
                      </p>
                      <p className="text-sm text-text-primary/50">
                        with {typeof appt.staff === 'object' ? (appt.staff as any).name : 'Staff'}
                      </p>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-sage/20 text-sage capitalize">
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Glow Up Roadmap */}
          {profile && (
            <section className="md:col-span-2">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Your Glow Up Roadmap</h2>
              <div className="bg-surface border border-blush rounded-xl p-8">
                {profile.practitionerComments && (
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-[0.05em] text-text-primary/50 mb-2">Practitioner Notes</p>
                    <p className="text-text-primary/80 leading-relaxed">{profile.practitionerComments}</p>
                  </div>
                )}
                {profile.skinGoals && (
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-[0.05em] text-text-primary/50 mb-2">Your Skin Goals</p>
                    <p className="text-text-primary/80 leading-relaxed">{profile.skinGoals}</p>
                  </div>
                )}
                {profile.recommendedProducts && profile.recommendedProducts.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.05em] text-text-primary/50 mb-4">Recommended For You</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {profile.recommendedProducts.map((product: any) => (
                        <a
                          key={product.id || product}
                          href={`/shop`}
                          className="p-3 bg-background border border-border rounded-xl hover:border-blush transition-colors"
                        >
                          <p className="text-sm font-medium text-text-primary">{typeof product === 'object' ? product.name : 'Product'}</p>
                          {typeof product === 'object' && <p className="text-xs text-text-primary/50 mt-0.5">${product.price}</p>}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Past Appointments */}
          {past.length > 0 && (
            <section className="md:col-span-2">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Past Appointments</h2>
              <div className="flex flex-col gap-3">
                {past.map((appt) => (
                  <div key={appt.id} className="bg-surface border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-70">
                    <div>
                      <p className="font-medium text-text-primary">{typeof appt.service === 'object' ? (appt.service as any).name : 'Service'}</p>
                      <p className="text-sm text-text-primary/60">{format(parseISO(String(appt.startTime)), 'MMMM d, yyyy')}</p>
                    </div>
                    <span className="text-xs text-text-primary/40 capitalize">{appt.status}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: client auth (sign-in, register) and personalized dashboard"
```

---

## Phase 9: CRON Reminders

### Task 10: Vercel Cron + Reminder Logic

**Files:**
- Create: `src/app/api/cron/reminders/route.ts`
- Create: `vercel.json`

- [ ] **Step 1: Create `src/app/api/cron/reminders/route.ts`**

```typescript
// src/app/api/cron/reminders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { sendAppointmentReminder } from '@/lib/resend'
import { sendReminderSMS } from '@/lib/twilio'
import { addHours, subHours, parseISO, format } from 'date-fns'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayloadClient()
  const now = new Date()
  const in24h = addHours(now, 24)
  const in1h = addHours(now, 1)
  const window = 30 // check window in minutes

  // 24-hour reminders
  const { docs: upcoming24 } = await payload.find({
    collection: 'appointments',
    where: {
      status: { in: ['scheduled', 'confirmed'] },
      reminderSent24h: { equals: false },
      startTime: {
        greater_than_equal: subHours(in24h, window / 60).toISOString(),
        less_than_equal: addHours(in24h, window / 60).toISOString(),
      },
    },
    limit: 50,
    depth: 1,
  })

  for (const appt of upcoming24) {
    const dateStr = format(parseISO(String(appt.startTime)), 'MMMM d \'at\' h:mm a')
    const serviceName = typeof appt.service === 'object' ? (appt.service as any).name : 'appointment'
    await Promise.allSettled([
      sendAppointmentReminder(appt.clientEmail as string, appt.clientName as string, serviceName, dateStr, false),
      sendReminderSMS(appt.clientPhone as string, appt.clientName as string, serviceName, dateStr, false),
      payload.update({ collection: 'appointments', id: appt.id, data: { reminderSent24h: true } }),
    ])
  }

  // 1-hour reminders
  const { docs: upcoming1h } = await payload.find({
    collection: 'appointments',
    where: {
      status: { in: ['scheduled', 'confirmed'] },
      reminderSent1h: { equals: false },
      startTime: {
        greater_than_equal: subHours(in1h, window / 60).toISOString(),
        less_than_equal: addHours(in1h, window / 60).toISOString(),
      },
    },
    limit: 50,
    depth: 1,
  })

  for (const appt of upcoming1h) {
    const dateStr = format(parseISO(String(appt.startTime)), 'h:mm a')
    const serviceName = typeof appt.service === 'object' ? (appt.service as any).name : 'appointment'
    await Promise.allSettled([
      sendAppointmentReminder(appt.clientEmail as string, appt.clientName as string, serviceName, dateStr, true),
      sendReminderSMS(appt.clientPhone as string, appt.clientName as string, serviceName, dateStr, true),
      payload.update({ collection: 'appointments', id: appt.id, data: { reminderSent1h: true } }),
    ])
  }

  return NextResponse.json({ processed24h: upcoming24.length, processed1h: upcoming1h.length })
}
```

- [ ] **Step 2: Create `vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: Vercel cron job for 24h and 1h appointment reminders"
```

---

## Phase 10: Seed Data + Final Polish

### Task 11: Seed script + README

**Files:**
- Create: `scripts/seed.ts`

- [ ] **Step 1: Create `scripts/seed.ts`**

```typescript
// scripts/seed.ts
import { getPayloadClient } from '../src/lib/payload'

async function seed() {
  const payload = await getPayloadClient()

  // Seed services
  const services = [
    { name: 'HydraFacial', description: 'A multi-step facial treatment that cleanses, exfoliates, and hydrates the skin using vortex-fusion technology. Ideal for all skin types.', durationMinutes: 60, price: 195, isActive: true },
    { name: 'LED Light Therapy', description: 'Non-invasive photobiomodulation using red and near-infrared wavelengths to stimulate collagen, reduce inflammation, and accelerate healing.', durationMinutes: 30, price: 85, isActive: true },
    { name: 'Microneedling', description: 'Controlled micro-injuries stimulate the skin\'s natural healing response, boosting collagen and elastin for smoother, firmer skin texture.', durationMinutes: 75, price: 299, isActive: true },
    { name: 'Chemical Peel', description: 'A precisely formulated exfoliation treatment that removes damaged surface cells to reveal brighter, more even-toned skin underneath.', durationMinutes: 45, price: 145, isActive: true },
  ]

  for (const s of services) {
    await payload.create({ collection: 'services', data: s as any })
    console.log(`✓ Seeded service: ${s.name}`)
  }

  // Seed products
  const products = [
    { name: 'Luminance Hydrating Serum', description: 'A lightweight, hyaluronic acid-rich serum that delivers 72-hour moisture retention.', price: 68, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', category: 'serum', isAvailable: true },
    { name: 'Glow Renewal Moisturizer', description: 'A nourishing cream that locks in treatment results with ceramides and peptides.', price: 85, imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38796?w=400', category: 'moisturizer', isAvailable: true },
    { name: 'SPF 50 Mineral Shield', description: 'A lightweight, mineral-based sunscreen that protects without clogging pores.', price: 42, imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'spf', isAvailable: true },
  ]

  for (const p of products) {
    await payload.create({ collection: 'products', data: p as any })
    console.log(`✓ Seeded product: ${p.name}`)
  }

  // Seed staff
  const staff = [
    { name: 'Dr. Amara Osei', role: 'Lead Skin Therapist', bio: 'Certified dermal therapist with 8+ years specializing in non-invasive skin rejuvenation.', isActive: true },
    { name: 'Priya Nair', role: 'Aesthetic Nurse', bio: 'Registered nurse and aesthetic specialist focused on LED and HydraFacial treatments.', isActive: true },
  ]

  for (const s of staff) {
    await payload.create({ collection: 'staff', data: s as any })
    console.log(`✓ Seeded staff: ${s.name}`)
  }

  console.log('\n✦ Seed complete.')
  process.exit(0)
}

seed().catch((e) => { console.error(e); process.exit(1) })
```

- [ ] **Step 2: Add seed script to `package.json`**

In `package.json` scripts section, add:
```json
"seed": "ts-node --project tsconfig.json scripts/seed.ts"
```

- [ ] **Step 3: Run dev server and verify everything loads**

```bash
npm run dev
# Verify:
# - http://localhost:3000 → homepage
# - http://localhost:3000/services → services
# - http://localhost:3000/shop → shop
# - http://localhost:3000/booking → booking wizard
# - http://localhost:3000/admin → Payload admin
```

- [ ] **Step 4: Final commit**

```bash
git add -A && git commit -m "feat: seed script and production-ready Lumin MedSpa webapp"
```

---

## Self-Review: Spec Coverage

| Requirement | Covered |
|---|---|
| Homepage with hero + glow branding | ✓ HeroSection.tsx |
| Services listing page | ✓ Phase 6, Task 6 |
| Shop with WhatsApp CTA | ✓ Phase 6, Task 7 |
| Booking portal (multi-step, no deposit) | ✓ Phase 7, Task 8 |
| Email/SMS booking confirmation | ✓ Task 8, booking route |
| 24h appointment reminder | ✓ Task 10, cron |
| 1h appointment reminder | ✓ Task 10, cron |
| Client dashboard (upcoming/past) | ✓ Task 9 |
| Personalized recommendations from admin | ✓ Profiles collection + dashboard |
| Admin CRUD for services | ✓ Payload admin auto-generated |
| Admin CRUD for products | ✓ Payload admin auto-generated |
| Admin booking management | ✓ Payload admin Appointments collection |
| Admin client profile notes | ✓ Profiles collection, cosmeticNotes field |
| Staff management | ✓ Staff collection |
| Mobile-first responsive | ✓ All components use Tailwind mobile-first |
| Brand palette (blush, warm grey, off-white) | ✓ tailwind.config.ts |
| Inter typography | ✓ globals.css + tailwind config |
| Framer Motion animations | ✓ Hero, cards, wizard |
| Vercel Cron | ✓ vercel.json |
| .env.local for all secrets | ✓ Task 1, Step 4 |

All 21 requirements covered. No gaps.
