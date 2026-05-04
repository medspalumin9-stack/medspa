import NextAuth, { type NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

// NextAuth v5 uses AUTH_SECRET / AUTH_URL — alias from NEXTAUTH_ vars if needed
if (!process.env.AUTH_SECRET && process.env.NEXTAUTH_SECRET) {
  process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET
}
if (!process.env.AUTH_URL && process.env.NEXTAUTH_URL) {
  process.env.AUTH_URL = process.env.NEXTAUTH_URL
}

function normalizeEmail(raw: unknown) {
  return String(raw ?? '').trim().toLowerCase()
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const email = normalizeEmail(credentials.email)
        if (!email) return null

        let user
        try {
          const { prisma } = await import('./prisma')
          user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
          })
        } catch {
          return null
        }
        if (!user) return null

        const valid = await bcrypt.compare(String(credentials.password), user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          canAccessAdminPortal: user.canAccessAdminPortal,
          canAccessClientPortal: user.canAccessClientPortal,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/signin' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
        token.canAccessAdminPortal = (user as { canAccessAdminPortal?: boolean }).canAccessAdminPortal
        token.canAccessClientPortal = (user as { canAccessClientPortal?: boolean }).canAccessClientPortal
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        try {
          const { prisma } = await import('./prisma')
          const row = await prisma.user.findUnique({
            where: { id: String(token.sub) },
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
              canAccessAdminPortal: true,
              canAccessClientPortal: true,
            },
          })
          if (row) {
            session.user.id = row.id
            session.user.email = row.email
            session.user.name = row.fullName
            ;(session.user as { role?: string }).role = row.role
            ;(session.user as { canAccessAdminPortal?: boolean }).canAccessAdminPortal = row.canAccessAdminPortal
            ;(session.user as { canAccessClientPortal?: boolean }).canAccessClientPortal = row.canAccessClientPortal
          }
        } catch {
          if (session.user) {
            session.user.id = String(token.id ?? token.sub)
            ;(session.user as { role?: string }).role = token.role as string
            ;(session.user as { canAccessAdminPortal?: boolean }).canAccessAdminPortal =
              token.canAccessAdminPortal as boolean
            ;(session.user as { canAccessClientPortal?: boolean }).canAccessClientPortal =
              token.canAccessClientPortal as boolean
          }
        }
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
