// Generates PWA / Android icons from an inline SVG. Run: node scripts/make-icons.mjs
// Logo: a banana-leaf plate with rice, dal and chutney on a deep green base with a dark rim,
// so it reads on both light and dark wallpapers.
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'

export const svg = (size, maskable) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#166534"/>
      <stop offset="1" stop-color="#0b3d22"/>
    </linearGradient>
    <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a3e635"/>
      <stop offset="1" stop-color="#4d7c0f"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${maskable ? 0 : 112}" fill="url(#bg)"/>
  ${maskable ? '' : '<rect x="6" y="6" width="500" height="500" rx="106" fill="none" stroke="#052e16" stroke-width="12"/>'}
  <!-- banana leaf -->
  <path d="M86 300 C86 200 180 150 300 150 C400 150 440 210 440 270 C440 340 360 380 250 380 C150 380 86 360 86 300 Z" fill="url(#leaf)"/>
  <path d="M110 300 C130 250 220 190 420 240" stroke="#365314" stroke-width="6" fill="none" opacity="0.6" stroke-linecap="round"/>
  <!-- rice mound -->
  <ellipse cx="236" cy="290" rx="78" ry="46" fill="#fffdf5"/>
  <ellipse cx="236" cy="282" rx="60" ry="34" fill="#ffffff"/>
  <!-- dal (turmeric) -->
  <circle cx="352" cy="250" r="34" fill="#d97706"/>
  <circle cx="352" cy="250" r="22" fill="#fbbf24"/>
  <!-- chutney (tomato) -->
  <circle cx="352" cy="330" r="26" fill="#dc2626"/>
  <circle cx="352" cy="330" r="15" fill="#f87171"/>
  <!-- poriyal (green) -->
  <circle cx="140" cy="330" r="26" fill="#14532d"/>
  <circle cx="140" cy="330" r="15" fill="#4ade80"/>
  <!-- steam -->
  <path d="M200 120 q 14 -26 0 -52 M236 120 q 14 -26 0 -52 M272 120 q 14 -26 0 -52" stroke="#ffffff" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.9"/>
</svg>`

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon.svg', svg(512, false))
await sharp(Buffer.from(svg(512, false))).png().toFile('public/icons/icon-512.png')
await sharp(Buffer.from(svg(192, false))).png().toFile('public/icons/icon-192.png')
await sharp(Buffer.from(svg(180, false))).png().toFile('public/icons/apple-touch-icon.png')
await sharp(Buffer.from(svg(512, true))).png().toFile('public/icons/icon-maskable-512.png')
console.log('icons written to public/icons')
