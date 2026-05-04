'use client'

import { signOut } from 'next-auth/react'

/**
 * Clears the session then navigates to `/` on the **current** origin.
 * Avoids relying on `AUTH_URL` / `NEXTAUTH_URL` for the post–sign-out redirect
 * (mis-set localhost on Vercel would send users to an unreachable URL).
 */
export async function signOutToHome() {
  await signOut({ redirect: false, callbackUrl: '/' })
  window.location.assign(`${window.location.origin}/`)
}
