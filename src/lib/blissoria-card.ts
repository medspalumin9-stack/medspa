/**
 * Blissoria template assets (Webflow CDN) — https://blissoria.webflow.io/services
 */
const CDN = 'https://cdn.prod.website-files.com/68ea3af8ec46b10a794300d9'

function thumb(
  id: string,
  file: string
): { src: string; srcSet: string } {
  const file500 = file.replace('.png', '-p-500.png')
  return {
    src: `${CDN}/${id}_${encodeURIComponent(file)}`,
    srcSet: `${CDN}/${id}_${encodeURIComponent(file500)} 500w, ${CDN}/${id}_${encodeURIComponent(file)} 533w`,
  }
}

/** Same order as Blissoria services listing (6 thumbnails). */
export const BLISSORIA_SERVICE_THUMBS = [
  thumb('68f5aee690cc9edf8be8fa3a', 'Services Thumbnail Image 06.png'),
  thumb('68f5aef511002aa249fb8d82', 'Services Thumbnail Image 05.png'),
  thumb('68f5af0376d6a294f1bb61da', 'Services Thumbnail Image 04.png'),
  thumb('68f9ab2dda625f6ff24dec77', 'Services Thumbnail Image 03.png'),
  thumb('68f5af1de7419952d7c8db1a', 'Services Thumbnail Image 02.png'),
  thumb('68f5af2c20a378c416db54d9', 'Services Thumbnail Image 01.png'),
] as const

export const BLISSORIA_SERVICE_THUMB_05 = BLISSORIA_SERVICE_THUMBS[1]

/** Responsive hint for card thumbs in a 1/2/3-column grid */
export const BLISSORIA_CARD_SIZES =
  '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 380px'

export function blissoriaServiceThumbForIndex(index: number) {
  return BLISSORIA_SERVICE_THUMBS[index % BLISSORIA_SERVICE_THUMBS.length]
}
