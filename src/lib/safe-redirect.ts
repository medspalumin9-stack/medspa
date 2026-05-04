/** Allow only same-origin relative paths (no protocol, no // open redirect). */
export function safeInternalPath(path: string | null | undefined): string | undefined {
  if (path == null || typeof path !== 'string') return undefined
  const t = path.trim()
  if (!t.startsWith('/') || t.startsWith('//')) return undefined
  if (t.includes('://')) return undefined
  return t
}
