import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
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
