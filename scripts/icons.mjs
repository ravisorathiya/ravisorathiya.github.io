// `npm run icons`: normalises app icons and generates PWA icons.
//  1. public/images/apps/<slug>.(png|jpg|webp) → 256×256 WebP (originals removed),
//     updating `icon:` in content/projects/<slug>.md when the extension changes.
//  2. public/images/avatar.webp → favicon.ico, favicon-96.png, pwa-192.png, pwa-512.png,
//     maskable-512.png, apple-touch-icon.png
import { existsSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import { ROOT_DIR } from './content-fs.mjs'

const APPS = join(ROOT_DIR, 'public/images/apps')
const PUBLIC = join(ROOT_DIR, 'public')
const SIZE = 256

let saved = 0
for (const file of readdirSync(APPS)) {
  const m = file.match(/^([a-z0-9-]+)\.(png|jpe?g|webp)$/)
  if (!m) continue
  const [, slug, ext] = m
  const src = join(APPS, file)
  const meta = await sharp(src).metadata()
  if (ext === 'webp' && meta.width <= SIZE) continue // already normalised

  const before = statSync(src).size
  const out = await sharp(src).resize(SIZE, SIZE, { fit: 'cover' }).webp({ quality: 90 }).toBuffer()
  const tmp = join(APPS, `${slug}.tmp.webp`)
  writeFileSync(tmp, out)
  if (ext !== 'webp') unlinkSync(src)
  renameSync(tmp, join(APPS, `${slug}.webp`))
  saved += before - out.length

  const md = join(ROOT_DIR, 'content/projects', `${slug}.md`)
  if (existsSync(md)) {
    const text = readFileSync(md, 'utf8')
    const next = text.replace(/^icon: .*$/m, `icon: /images/apps/${slug}.webp`)
    if (next !== text) writeFileSync(md, next)
  }
  console.log(`icon  ${file} → ${slug}.webp  (${(before / 1024).toFixed(0)} KB → ${(out.length / 1024).toFixed(0)} KB)`)
}

// Favicons + PWA / home-screen icons from the profile photo (public/images/avatar.webp).
// Browser tabs and Google results get a round crop; iOS and maskable icons stay
// square because the OS applies its own mask.
const AVATAR = join(PUBLIC, 'images/avatar.webp')
const square = (size) => sharp(AVATAR).resize(size, size, { fit: 'cover', kernel: 'lanczos3' }).png().toBuffer()
const round = async (size) =>
  sharp(await square(size))
    .composite([{ input: Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`), blend: 'dest-in' }])
    .png()
    .toBuffer()

// favicon.ico with PNG entries (16, 32, 48). Google needs a square icon whose size is a multiple of 48px.
const icoSizes = [16, 32, 48]
const pngs = await Promise.all(icoSizes.map(round))
const header = Buffer.alloc(6 + 16 * pngs.length)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(pngs.length, 4)
let offset = header.length
pngs.forEach((png, i) => {
  const e = 6 + 16 * i
  header.writeUInt8(icoSizes[i] % 256, e)
  header.writeUInt8(icoSizes[i] % 256, e + 1)
  header.writeUInt16LE(1, e + 4) // colour planes
  header.writeUInt16LE(32, e + 6) // bits per pixel
  header.writeUInt32LE(png.length, e + 8)
  header.writeUInt32LE(offset, e + 12)
  offset += png.length
})
writeFileSync(join(PUBLIC, 'favicon.ico'), Buffer.concat([header, ...pngs]))

for (const [name, size, make] of [
  ['favicon-96.png', 96, round],
  ['pwa-192.png', 192, round],
  ['pwa-512.png', 512, round],
  ['apple-touch-icon.png', 180, square],
  ['maskable-512.png', 512, square],
]) writeFileSync(join(PUBLIC, name), await make(size))
console.log(`pwa   favicon + icons written from avatar · app icons saved ${(saved / 1024).toFixed(0)} KB`)
