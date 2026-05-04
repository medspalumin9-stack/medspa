import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Canonical app root = folder that contains this file (stable even when multiple lockfiles confuse detection).
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)))

const tailwindRoot = path.join(projectRoot, 'node_modules', 'tailwindcss')
const tailwindPostcssRoot = path.join(projectRoot, 'node_modules', '@tailwindcss', 'postcss')

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
    // Force Tailwind v4 packages to resolve inside this app (fixes "Can't resolve 'tailwindcss' in C:\...\Projects").
    resolveAlias: {
      tailwindcss: tailwindRoot,
      '@tailwindcss/postcss': tailwindPostcssRoot,
    },
  },
  experimental: {
    /** Dev: reduce Turbopack worker OOM when compiling heavy CSS trees (bytes). */
    turbopackMemoryLimit: 2 * 1024 * 1024 * 1024,
  },
  // Let Node resolve Prisma + pg at runtime (avoids Turbopack SSR chunks that miss `.prisma/client`)
  serverExternalPackages: ['@prisma/client', 'prisma', '@prisma/adapter-pg', 'pg'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default nextConfig
