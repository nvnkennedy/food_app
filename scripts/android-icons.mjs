// Writes Android launcher icons (legacy + adaptive) and splash drawables from the same SVG.
import sharp from 'sharp'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const svg = readFileSync('public/icons/icon.svg')
const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 }
const base = 'android/app/src/main/res'

for (const [d, f] of Object.entries(dens)) {
  const dir = `${base}/mipmap-${d}`
  if (!existsSync(dir)) continue
  const legacy = Math.round(48 * f)
  await sharp(svg).resize(legacy, legacy).png().toFile(`${dir}/ic_launcher.png`)
  await sharp(svg).resize(legacy, legacy).png().toFile(`${dir}/ic_launcher_round.png`)
  // adaptive foreground: 108dp canvas, artwork in the centre 66%
  const canvas = Math.round(108 * f)
  const art = Math.round(canvas * 0.62)
  const fg = await sharp(svg).resize(art, art).png().toBuffer()
  await sharp({ create: { width: canvas, height: canvas, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: fg, gravity: 'centre' }])
    .png()
    .toFile(`${dir}/ic_launcher_foreground.png`)
}
writeFileSync(`${base}/values/ic_launcher_background.xml`, `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#15803D</color>\n</resources>\n`)

// splash: warm background with the icon centred
for (const [d, f] of Object.entries(dens)) {
  for (const orient of ['port', 'land']) {
    const dir = `${base}/drawable-${orient}-${d}`
    if (!existsSync(dir)) continue
    const w = Math.round((orient === 'port' ? 480 : 800) * f)
    const h = Math.round((orient === 'port' ? 800 : 480) * f)
    const art = Math.round(Math.min(w, h) * 0.3)
    const fg = await sharp(svg).resize(art, art).png().toBuffer()
    await sharp({ create: { width: w, height: h, channels: 4, background: '#f7f8f5' } })
      .composite([{ input: fg, gravity: 'centre' }])
      .png()
      .toFile(`${dir}/splash.png`)
  }
}
const art = 200
const fg = await sharp(svg).resize(art, art).png().toBuffer()
await sharp({ create: { width: 480, height: 800, channels: 4, background: '#f7f8f5' } }).composite([{ input: fg, gravity: 'centre' }]).png().toFile(`${base}/drawable/splash.png`)
console.log('android icons + splash written')
