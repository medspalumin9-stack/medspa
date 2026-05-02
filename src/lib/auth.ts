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
        const valid = await bcrypt.compare(
          String(credentials.password),
          String(client.passwordHash)
        )
        if (!valid) return null
        return {
          id: String(client.id),
          email: client.email,
          name: client.fullName,
        }
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
