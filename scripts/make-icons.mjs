// Generates PWA / Android icons from an inline SVG. Run: node scripts/make-icons.mjs
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'

const svg = (size, maskable) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <rect width="512" height="512" rx="${maskable ? 0 : 110}" fill="#c2410c"/>
  <circle cx="256" cy="290" r="150" fill="#fff7ed"/>
  <circle cx="256" cy="290" r="110" fill="#fdba74"/>
  <ellipse cx="256" cy="275" rx="70" ry="42" fill="#fff7ed"/>
  <path d="M200 130 q 20 -40 0 -80 M256 130 q 20 -40 0 -80 M312 130 q 20 -40 0 -80" stroke="#fff7ed" stroke-width="18" fill="none" stroke-linecap="round" opacity="0.9"/>
</svg>`

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon.svg', svg(512, false))
await sharp(Buffer.from(svg(512, false))).png().toFile('public/icons/icon-512.png')
await sharp(Buffer.from(svg(192, false))).png().toFile('public/icons/icon-192.png')
await sharp(Buffer.from(svg(180, false))).png().toFile('public/icons/apple-touch-icon.png')
await sharp(Buffer.from(svg(512, true))).png().toFile('public/icons/icon-maskable-512.png')
console.log('icons written to public/icons')
