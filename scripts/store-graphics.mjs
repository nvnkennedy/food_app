// Google Play store graphics: 512x512 icon and 1024x500 feature graphic. Run: node scripts/store-graphics.mjs
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { svg } from './make-icons.mjs'

mkdirSync('release/store', { recursive: true })

// Play icon: 512x512, no transparency, no rounded corners (Play rounds it)
await sharp(Buffer.from(svg(512, true))).png().toFile('release/store/icon-512.png')

const feature = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 500" width="1024" height="500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#166534"/>
      <stop offset="1" stop-color="#15803d"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <circle cx="900" cy="80" r="180" fill="#22c55e" opacity="0.25"/>
  <circle cx="120" cy="460" r="140" fill="#f59e0b" opacity="0.2"/>
  <g transform="translate(70,110) scale(0.55)">${svg(512, false).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>
  <text x="400" y="215" font-family="Inter, Segoe UI, Roboto, sans-serif" font-size="92" font-weight="800" fill="#ffffff" letter-spacing="-2">Virundhu</text>
  <text x="402" y="275" font-family="Inter, Segoe UI, Roboto, sans-serif" font-size="34" font-weight="500" fill="#dcfce7">South Indian family meal planner</text>
  <text x="402" y="330" font-family="Inter, Segoe UI, Roboto, sans-serif" font-size="26" fill="#bbf7d0">Daily plan · portions per person · protein, iron, fibre · budget</text>
</svg>`
await sharp(Buffer.from(feature)).png().toFile('release/store/feature-1024x500.png')
console.log('store graphics written to release/store')
