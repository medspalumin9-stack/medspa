import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { requireAdminApi } from '@/lib/admin-guard'
import { getSupabaseAdmin, getStorageBucket } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdminApi()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
    const storagePath = `images/${filename}`

    const supabase = getSupabaseAdmin()
    if (supabase) {
      const bucket = getStorageBucket()
      const bytes = await file.arrayBuffer()
      const { error } = await supabase.storage.from(bucket).upload(storagePath, Buffer.from(bytes), {
        contentType: file.type,
        upsert: false,
      })
      if (error) {
        console.error('Supabase upload failed:', error)
        return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath)
      return NextResponse.json({ url: data.publicUrl })
    }

    // Filesystem writes only work locally — Vercel/serverless hosts have a read-only disk
    if (process.env.VERCEL) {
      return NextResponse.json(
        { error: 'Image uploads are not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 503 },
      )
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })
    const bytes = await file.arrayBuffer()
    await writeFile(join(uploadsDir, filename), Buffer.from(bytes))

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (err) {
    console.error('Upload failed:', err)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
