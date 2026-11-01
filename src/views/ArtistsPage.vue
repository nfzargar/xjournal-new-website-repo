<template>
  <SiteShell scroll :issue-id="issueIndex">
    <div class="artists">
      <h1 class="artists__title">artists</h1>
      <p class="artists__volume">x{{ issueIndex }}</p>
      <ul class="artists__list">
        <li v-for="artistId in issueArtistIds" :id="bookmark(artistId)" :key="artistId" class="artists__row">
          <p class="artists__name">{{ artistName(artistId) }}</p>
          <ul class="artists__works">
            <li v-for="artworkId in artistsWorks(artistId)" :key="artworkId">
              <router-link
                class="artists__work"
                :to="{ path: `/volume/${issueIndex}`, query: { page: artworkPageNumber(artworkId) } }">
                {{ artworkTitle(artworkId) }}
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </SiteShell>
</template>

<script>
import sourceData from '@/data'
import SiteShell from '@/components/SiteShell.vue'
import { firstOfEachSeries } from '@/volumes'

export default {
  components: { SiteShell },
  props: {
    issueIndex: {
      required: true,
      type: String
    }
  },
  computed: {
    issueArtistIds () {
      return Object.keys(sourceData.artists)
        .filter(id => sourceData.artists[id].issueIds.includes(this.issueIndex))
    },
    issueArtworkIds () {
      return Object.keys(sourceData.artworks)
        .filter(id => sourceData.artworks[id].issueId === this.issueIndex)
    }
  },
  mounted () {
    // Scroll to the artist named in the URL hash (#First_Last).
    const hash = this.$route.hash
    if (!hash) return
    this.$nextTick(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  },
  methods: {
    artistName (id) {
      return sourceData.artists[id].name
    },
    artworkPageNumber (id) {
      return sourceData.artworks[id].pageNumber
    },
    artworkTitle (id) {
      return sourceData.artworks[id].title
    },
    // Works can be co-authored, in which case artistId is an array.
    artistsWorks (id) {
      const works = this.issueArtworkIds.filter(x => {
        const by = sourceData.artworks[x].artistId
        return Array.isArray(by) ? by.includes(id) : by === id
      })
      return firstOfEachSeries(works.map(x => ({ ...sourceData.artworks[x], id: x }))).map(art => art.id)
    },
    bookmark (id) {
      return this.artistName(id).split(' ').join('_')
    }
  }
}
</script>

<style scoped>
.artists {
  max-width: 64rem;
  margin: 0 auto;
}

.artists__title {
  margin: 0;
  font-size: clamp(3rem, 12vw, 8rem);
  line-height: 0.9;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.artists__volume {
  margin: 0.5rem 0 2.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #ff3b30;
}

.artists__list,
.artists__works {
  margin: 0;
  padding: 0;
  list-style: none;
}

.artists__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 0.6rem 0;
  border-top: 1px solid rgba(0, 0, 0, 0.25);
  font-size: 1.25rem;
  line-height: 1.3;
}

.artists__name {
  margin: 0;
  font-weight: 700;
}

.artists__work {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.artists__work:hover {
  color: #ff3b30;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 40em) {
  .artists__row { grid-template-columns: 1fr; gap: 0.25rem; }
}
</style>
