import { defineConfig, env } from 'prisma/config'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Prisma CLI only auto-loads `.env`, while Next.js uses `.env.local`.
 * Hydrate DATABASE_URI from those files so `npx prisma db push` works
 * without extra flags (see also: `npm run db:push`).
 */
function hydrateDatabaseUriFromEnvFiles() {
  if (process.env.DATABASE_URI?.trim()) return
  for (const file of ['.env.local', '.env']) {
    const filepath = resolve(process.cwd(), file)
    if (!existsSync(filepath)) continue
    const text = readFileSync(filepath, 'utf8')
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      if (key !== 'DATABASE_URI') continue
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      process.env.DATABASE_URI = value
      return
    }
  }
}

hydrateDatabaseUriFromEnvFiles()

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URI'),
  },
})
