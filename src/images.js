// Image URLs for artwork. data.json keeps the spreadsheet's original file names; when
// scripts/compress-images.cjs converts one (e.g. a PNG photo to JPEG) the new name is in
// image-manifest.json, so always build artwork URLs through here.
import manifest from '@/image-manifest.json'

const renamed = manifest.renamed || {}

export const imageFile = name => renamed[name] || name

// size: 1200, 768 or 400
export const imageUrl = (name, size) =>
  `${import.meta.env.BASE_URL}images/compressed/${size}/${imageFile(name)}`
