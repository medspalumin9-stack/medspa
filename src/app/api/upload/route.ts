import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { auth } from '@/lib/auth'
import { userHasAdminSection } from '@/lib/admin-sections'
import type { SessionUserWithAdmin } from '@/lib/admin-guard'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const u = session.user as SessionUserWithAdmin
  if (
    !u.canAccessAdminPortal
    || (!userHasAdminSection(u, 'services') && !userHasAdminSection(u, 'products'))
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, or WebP.' }, { status: 400 })
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const uploadsDir = join(process.cwd(), 'public', 'uploads')

  await mkdir(uploadsDir, { recursive: true })
  const bytes = await file.arrayBuffer()
  await writeFile(join(uploadsDir, filename), Buffer.from(bytes))

  return NextResponse.json({ url: `/uploads/${filename}` })
}
