import sourceData from '@/data'

// The newest volume is simply the highest issue number in data.json.
export const latestIssue = () => String(Math.max(...Object.keys(sourceData.issues).map(Number)))

// Newest first.
export const allIssues = () => Object.keys(sourceData.issues).map(Number).sort((a, b) => b - a)

export const volumeLink = n => String(n) === latestIssue() ? '/latest' : `/volume/${n}`

// Artworks with the same title by the same artist count as one series. Works with no title, no
// credited artist, or the title "Untitled" never do, because nothing shows they belong together.
const seriesKey = art => {
  const artists = [].concat(art.artistId || []).slice().sort().join(',')
  const title = (art.title || '').trim().toLowerCase()
  return artists && title && title !== 'untitled' ? `${artists}|${title}` : null
}

// Puts each series together, wherever the book placed its works. A series takes the position of
// its first artwork; nothing else moves, so an artist's other works stay in their own places.
export const groupSameWorks = artworks => {
  const groups = new Map()
  artworks.forEach((art, i) => {
    const key = seriesKey(art) || `solo-${i}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(art)
  })
  return [...groups.values()].flat()
}

// One artwork per series, for lists that name each title once.
export const firstOfEachSeries = artworks => {
  const seen = new Set()
  return artworks.filter(art => {
    const key = seriesKey(art)
    if (!key) return true
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// Volumes whose written piece isn't an essay. data.json is regenerated from the spreadsheet,
// so this lives here rather than in the data.
const OTHER_READINGS = {
  3: { label: 'poem', path: '/issue/3/poem' }
}

// The written piece that goes with a volume: its essay, or for volumes whose piece isn't an
// essay (volume 3's poem), the entry in OTHER_READINGS.
export const readingFor = issueId => {
  const issue = sourceData.issues[issueId]
  if (issue && issue.essayId) return { label: 'essay', path: `/issue/${issueId}/essay` }
  return OTHER_READINGS[issueId] || null
}
