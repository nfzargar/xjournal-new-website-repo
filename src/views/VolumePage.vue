<template>
  <SiteShell :issue-id="String(issueId)" @drawer="open => drawerOpen = open">
    <main
      class="latest__stage"
      @wheel.prevent="onWheel"
      @touchstart.passive="onTouchStart"
      @touchend="onTouchEnd">
      <MorphViewer v-if="frames.length" :frames="frameSources" :index="active" />
      <p v-else class="latest__empty">No artwork in x{{ issueId }} yet.</p>
    </main>

    <transition name="fade" mode="out-in">
      <div v-if="current" :key="current.pageNumber" class="latest__caption">
        <p class="latest__title">{{ current.title }}<span v-if="current.yearMade">, {{ current.yearMade }}</span></p>
        <p>{{ artistName(current) }}</p>
        <p v-if="meta(current)" class="latest__meta">{{ meta(current) }}</p>
      </div>
    </transition>

    <div class="latest__count">
      <p class="latest__volume">x{{ issueId }}</p>
      <p>{{ frame ? frame.artIndex + 1 : 0 }} / {{ artworks.length }}</p>
      <p v-if="frame && frame.imageCount > 1" class="latest__meta">image {{ frame.imageIndex + 1 }} of {{ frame.imageCount }}</p>
    </div>
    <button
      v-if="active < frames.length - 1"
      type="button"
      class="latest__hint"
      aria-label="next artwork"
      @click="go(active + 1)">&#8595;</button>
  </SiteShell>
</template>

<script>
import sourceData from '@/data'
import MorphViewer from '@/components/MorphViewer.vue'
import SiteShell from '@/components/SiteShell.vue'
import { imageUrl } from '@/images'
import { groupSameWorks, latestIssue } from '@/volumes'

// Minimum gap between wheel-driven steps, so one trackpad flick moves one artwork.
const WHEEL_COOLDOWN = 900

export default {
  name: 'VolumePage',
  components: { MorphViewer, SiteShell },
  data () {
    return { active: 0, drawerOpen: false }
  },
  computed: {
    // /volume/:issueId shows that volume, /latest the newest one.
    issueId () {
      return this.$route.params.issueId || latestIssue()
    },
    artworks () {
      return groupSameWorks(Object.values(sourceData.artworks)
        .filter(a => a.issueId === this.issueId && a.imageNames && a.imageNames.length)
        .sort((a, b) => (Number(a.pageNumber) || 0) - (Number(b.pageNumber) || 0)))
    },
    // One frame per image; artworks with several images get several frames.
    frames () {
      const out = []
      this.artworks.forEach((art, artIndex) => {
        art.imageNames.forEach((image, imageIndex) => {
          out.push({ art, artIndex, image, imageIndex, imageCount: art.imageNames.length })
        })
      })
      return out
    },
    frameSources () {
      return this.frames.map(f => ({
        small: imageUrl(f.image, 768),
        large: imageUrl(f.image, 1200)
      }))
    },
    frame () {
      return this.frames[this.active]
    },
    current () {
      return this.frame && this.frame.art
    }
  },
  watch: {
    issueId () {
      this.active = this.startFrame()
    }
  },
  created () {
    this.active = this.startFrame()
    this.lastWheel = 0
  },
  mounted () {
    window.addEventListener('keydown', this.onKey)
  },
  beforeUnmount () {
    window.removeEventListener('keydown', this.onKey)
  },
  methods: {
    // ?page=<pageNumber> deep-links to a specific artwork (used by the old artwork URLs).
    startFrame () {
      const page = this.$route.query.page
      if (!page) return 0
      const i = this.frames.findIndex(f => String(f.art.pageNumber) === String(page))
      return i < 0 ? 0 : i
    },
    artistName (art) {
      const ids = Array.isArray(art.artistId) ? art.artistId : [art.artistId]
      return ids.map(id => (sourceData.artists[id] || {}).name).filter(Boolean).join(', ')
    },
    meta (art) {
      const size = art.size && art.size !== 'none' ? art.size : ''
      return [art.description, size].filter(Boolean).join(' · ')
    },
    go (i) {
      this.active = Math.max(0, Math.min(i, this.frames.length - 1))
    },
    onWheel (e) {
      if (this.drawerOpen || Math.abs(e.deltaY) < 8) return
      const now = Date.now()
      if (now - this.lastWheel < WHEEL_COOLDOWN) {
        // Trackpad momentum keeps firing: extend the lock instead of stepping again.
        this.lastWheel = now
        return
      }
      this.lastWheel = now
      this.go(this.active + (e.deltaY > 0 ? 1 : -1))
    },
    onTouchStart (e) {
      this.touchY = e.changedTouches[0].clientY
    },
    onTouchEnd (e) {
      if (this.touchY == null) return
      const dy = e.changedTouches[0].clientY - this.touchY
      this.touchY = null
      if (Math.abs(dy) > 48) this.go(this.active + (dy < 0 ? 1 : -1))
    },
    onKey (e) {
      if (this.drawerOpen) return
      if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault()
        this.go(this.active + 1)
      } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        this.go(this.active - 1)
      }
    }
  }
}
</script>

<style scoped>
/* The artwork area: clear of the bar above and the caption below. */
.latest__stage {
  position: absolute;
  top: 5rem;
  right: 2rem;
  bottom: 7.5rem;
  left: 2rem;
  touch-action: none;
}

.latest__empty {
  margin: 0;
  padding-top: 30vh;
  text-align: center;
}

.latest__caption {
  position: absolute;
  left: 2rem;
  bottom: 1.5rem;
  z-index: 2;
  /* stop short of the centered next arrow */
  max-width: calc(50% - 4rem);
  font-size: 1rem;
  line-height: 1.35;
}

.latest__caption p,
.latest__count p {
  margin: 0;
}

.latest__title {
  color: #ff3b30;
  font-weight: 700;
  font-size: calc(1rem + 2px);
}

.latest__meta {
  opacity: 0.6;
}

.latest__count {
  position: absolute;
  right: 2rem;
  bottom: 1.5rem;
  z-index: 2;
  margin: 0;
  text-align: right;
  line-height: 1.35;
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
}

.latest__count .latest__volume {
  color: #ff3b30;
  font-weight: 700;
  font-size: calc(1rem + 2px);
}

.latest__hint {
  position: absolute;
  left: 50%;
  bottom: 1.25rem;
  transform: translateX(-50%);
  z-index: 2;
  background: none;
  border: 0;
  font-size: 1.5rem;
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 40em) {
  .latest__stage { top: 4.5rem; right: 1rem; bottom: 8rem; left: 1rem; }
  .latest__caption { left: 1rem; max-width: calc(50% - 2.5rem); }
  .latest__count { right: 1rem; }
}
</style>
