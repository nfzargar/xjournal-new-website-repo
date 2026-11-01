#!/usr/bin/env node
// Keeps every artwork image small enough for the volume viewer.
//
// Runs automatically before `npm run dev`, `npm run serve` and `npm run build` (so on every
// Vercel deploy), and on demand with `npm run images`. It only does work for images that need it.
//
// For each image named in src/data.json, in public/images/compressed/1200/:
//   - originals that are too big (wider than 1200px, over 1 MB, CMYK, or photos saved as PNG)
//     are backed up to image-originals/volume-N/ and replaced with a web-sized version:
//     max 1200px wide, sRGB, JPEG quality 82 (PNG kept only when it has transparency);
//   - the 768px and 400px copies are created when missing.
//
// data.json is generated from the spreadsheet, so it is never edited. When a PNG photo becomes a
// JPEG, the new name is recorded in src/image-manifest.json and the site looks it up there
// (see src/images.js).

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const ROOT = path.join(__dirname, '..')
const DATA = path.join(ROOT, 'src/data.json')
const MANIFEST = path.join(ROOT, 'src/image-manifest.json')
const IMAGES = path.join(ROOT, 'public/images/compressed')
const BACKUP = path.join(ROOT, 'image-originals')

const MAX_WIDTH = 1200
const SMALLER_SIZES = [768, 400]
const MAX_BYTES = 1000 * 1000
const JPEG = { quality: 82, mozjpeg: true }

const dir = size => path.join(IMAGES, String(size))
const exists = p => fs.existsSync(p)

const loadManifest = () => {
  const empty = { renamed: {}, optimized: [] }
  if (!exists(MANIFEST)) return empty
  return Object.assign(empty, JSON.parse(fs.readFileSync(MANIFEST, 'utf8')))
}

// Every image name in data.json, with where it's used (for readable warnings).
const imagesInData = () => {
  const data = JSON.parse(fs.readFileSync(DATA, 'utf8'))
  const out = new Map()
  Object.values(data.artworks).forEach(art => {
    (art.imageNames || []).forEach(name => {
      if (!out.has(name)) out.set(name, { volume: art.issueId, title: art.title })
    })
  })
  return out
}

// A photo saved as PNG: no transparency actually used.
const isOpaquePng = async (file, meta) => {
  if (meta.format !== 'png') return false
  if (!meta.hasAlpha) return true
  return (await sharp(file).stats()).isOpaque
}

// An unused name for the JPEG version, in case `name.jpg` is already taken by another image.
const jpegName = (file, taken) => {
  const base = file.replace(/\.[^.]+$/, '')
  let candidate = `${base}.jpg`
  for (let n = 2; taken(candidate); n++) candidate = `${base}-${n}.jpg`
  return candidate
}

const resized = (input, width, format) => {
  const pipeline = sharp(input, { failOn: 'none' })
    .rotate() // bake in camera orientation before metadata is dropped
    .resize({ width, withoutEnlargement: true })
    .toColorspace('srgb')
  return format === 'png'
    ? pipeline.png({ compressionLevel: 9 }).toBuffer()
    : pipeline.jpeg(JPEG).toBuffer()
}

async function main () {
  const manifest = loadManifest()
  const optimized = new Set(manifest.optimized)
  const usedNames = new Set(Object.values(manifest.renamed))
  const stats = { compressed: 0, sizes: 0, missing: 0, failed: 0 }

  for (const [name, where] of imagesInData()) {
    const file = manifest.renamed[name] || name
    const src = path.join(dir(MAX_WIDTH), file)
    const label = `volume ${where.volume} "${where.title}" (${name})`

    if (!exists(src)) {
      console.warn(`[images] missing: ${label}`)
      stats.missing++
      continue
    }

    try {
      // Animated GIFs stay as they are (resizing would break the animation); just make sure
      // every size exists.
      if (/\.gif$/i.test(file)) {
        for (const size of SMALLER_SIZES) {
          if (!exists(path.join(dir(size), file))) {
            fs.copyFileSync(src, path.join(dir(size), file))
            stats.sizes++
          }
        }
        continue
      }

      const meta = await sharp(src).metadata()
      const bytes = fs.statSync(src).size
      const opaquePng = await isOpaquePng(src, meta)
      const needsWork = meta.width > MAX_WIDTH ||
        meta.space === 'cmyk' ||
        opaquePng ||
        (bytes > MAX_BYTES && !optimized.has(file))

      let out = file
      if (needsWork) {
        const backup = path.join(BACKUP, `volume-${where.volume}`, file)
        if (!exists(backup)) {
          fs.mkdirSync(path.dirname(backup), { recursive: true })
          fs.copyFileSync(src, backup)
        }
        const keepPng = meta.format === 'png' && !opaquePng
        if (!keepPng && meta.format !== 'jpeg') {
          out = jpegName(file, n => n !== file && (exists(path.join(dir(MAX_WIDTH), n)) || usedNames.has(n)))
        }
        const buffer = await resized(src, MAX_WIDTH, keepPng ? 'png' : 'jpeg')
        fs.writeFileSync(path.join(dir(MAX_WIDTH), out), buffer)
        if (out !== file) {
          fs.unlinkSync(src)
          manifest.renamed[name] = out
          usedNames.add(out)
          // Stale smaller copies under the old name.
          SMALLER_SIZES.forEach(size => {
            const old = path.join(dir(size), file)
            if (exists(old)) fs.unlinkSync(old)
          })
        }
        optimized.add(out)
        stats.compressed++
        console.log(`[images] compressed ${label}: ${(bytes / 1e6).toFixed(1)} MB -> ${(buffer.length / 1e6).toFixed(1)} MB`)
      }

      // Smaller copies: create when missing, and regenerate after the 1200 version changed.
      const format = /\.png$/i.test(out) ? 'png' : 'jpeg'
      for (const size of SMALLER_SIZES) {
        const target = path.join(dir(size), out)
        if (needsWork || !exists(target)) {
          fs.writeFileSync(target, await resized(path.join(dir(MAX_WIDTH), out), size, format))
          stats.sizes++
        }
      }
    } catch (err) {
      console.warn(`[images] could not process ${label}: ${err.message}`)
      stats.failed++
    }
  }

  const next = {
    renamed: Object.fromEntries(Object.entries(manifest.renamed).sort()),
    optimized: [...optimized].sort()
  }
  const text = JSON.stringify(next, null, 2) + '\n'
  if (!exists(MANIFEST) || fs.readFileSync(MANIFEST, 'utf8') !== text) fs.writeFileSync(MANIFEST, text)

  console.log(`[images] compressed ${stats.compressed}, generated ${stats.sizes} sizes, ` +
    `${stats.missing} missing, ${stats.failed} failed`)
}

main().catch(err => {
  console.error('[images]', err)
  process.exit(1)
})
