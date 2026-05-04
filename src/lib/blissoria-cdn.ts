/** Blissoria template CDN (Webflow) — https://blissoria.webflow.io/ */
const SITE = 'https://cdn.prod.website-files.com/68ea26027ccb3085d19c922f'

export const BLISSORIA_BTN_ICON_PRIMARY = `${SITE}/68ee205f579ec95674bf8a10_Button%20Icon.webp`
export const BLISSORIA_BTN_ICON_ALT = `${SITE}/68ee2ea014b705c6b69580e9_Button%20Icon.webp`
export const BLISSORIA_NAV_LOGO = `${SITE}/68ee1e3d2eeac37be6850fa1_Nav%20Logo.webp`

export const BLISSORIA_FOOTER_BG = {
  desktop: {
    src: `${SITE}/68f35c740cc312bb0b9ede34_Footer%20Bg.webp`,
    srcSet: `${SITE}/68f35c740cc312bb0b9ede34_Footer%20Bg-p-500.webp 500w, ${SITE}/68f35c740cc312bb0b9ede34_Footer%20Bg-p-800.webp 800w, ${SITE}/68f35c740cc312bb0b9ede34_Footer%20Bg-p-1080.webp 1080w, ${SITE}/68f35c740cc312bb0b9ede34_Footer%20Bg-p-1600.webp 1600w, ${SITE}/68f35c740cc312bb0b9ede34_Footer%20Bg.webp 1920w`,
    sizes: '(max-width: 1920px) 100vw, 1920px',
  },
  tab: {
    src: `${SITE}/68fec081e18eaa0035e9b384_Footer%20BG%20Tab.webp`,
    srcSet: `${SITE}/68fec081e18eaa0035e9b384_Footer%20BG%20Tab-p-500.webp 500w, ${SITE}/68fec081e18eaa0035e9b384_Footer%20BG%20Tab.webp 810w`,
    sizes: '(max-width: 810px) 100vw, 810px',
  },
  mobile: {
    src: `${SITE}/68fec58a49e80530bb55c5a5_Footer%20Bg%20Mobile.webp`,
  },
} as const
