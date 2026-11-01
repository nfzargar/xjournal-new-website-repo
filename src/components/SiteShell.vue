<template>
  <div class="site">
    <header class="site__bar" :class="{ 'is-solid': scroll }">
      <router-link class="site__brand" to="/"><ProximityText label="xjournal" :radius="90" /></router-link>
      <nav class="site__nav">
        <router-link class="site__quick" :to="'/issue/' + volume + '/artists'"><ProximityText label="artists" /></router-link>
        <router-link v-if="reading" class="site__quick" :to="reading.path"><ProximityText :label="reading.label" /></router-link>
        <router-link class="site__quick" to="/submit"><ProximityText label="submit" /></router-link>
        <button
          type="button"
          class="site__explore"
          :class="{ 'is-hidden': drawerOpen }"
          :aria-expanded="String(drawerOpen)"
          aria-controls="site-drawer"
          @click="setDrawer(true)">explore</button>
      </nav>
    </header>

    <main v-if="scroll" class="site__scroll">
      <slot />
    </main>
    <slot v-else />

    <div class="site__backdrop" :class="{ 'is-open': drawerOpen }" @click="setDrawer(false)"></div>
    <aside id="site-drawer" class="site__drawer" :class="{ 'is-open': drawerOpen }" :aria-hidden="String(!drawerOpen)">
      <ul class="site__menu">
        <li><router-link :to="'/issue/' + volume + '/artists'" @click="setDrawer(false)">artists</router-link></li>
        <li v-if="reading"><router-link :to="reading.path" @click="setDrawer(false)">{{ reading.label }}</router-link></li>
        <li>
          <button type="button" :aria-expanded="String(volumesOpen)" @click="volumesOpen = !volumesOpen">volume</button>
          <ul v-show="volumesOpen" class="site__sub">
            <li v-for="n in issues" :key="n">
              <router-link :to="volumeLink(n)" @click="setDrawer(false)">x{{ n }}</router-link>
            </li>
          </ul>
        </li>
      </ul>
      <ul class="site__menu site__foot">
        <li><router-link to="/submit" @click="setDrawer(false)">submit</router-link></li>
        <li><router-link to="/about" @click="setDrawer(false)">about</router-link></li>
      </ul>
    </aside>
    <button
      type="button"
      class="site__close"
      :class="{ 'is-open': drawerOpen }"
      aria-label="close menu"
      @click="setDrawer(false)">&times;</button>
  </div>
</template>

<script>
import ProximityText from '@/components/ProximityText.vue'
import { allIssues, latestIssue, readingFor, volumeLink } from '@/volumes'

// The shared frame of the redesigned pages: the top bar, the black "explore" drawer and,
// when `scroll` is set, a scrolling content area under the bar. Without `scroll` the slot is
// laid out freely over the whole screen (the volume viewer positions its own stage).
export default {
  name: 'SiteShell',
  components: { ProximityText },
  props: {
    // The volume this page belongs to; the drawer's artists / reading links follow it.
    issueId: { type: String, default: '' },
    scroll: { type: Boolean, default: false }
  },
  emits: ['drawer'],
  data () {
    return { drawerOpen: false, volumesOpen: false }
  },
  computed: {
    volume () {
      return this.issueId || latestIssue()
    },
    reading () {
      return readingFor(this.volume)
    },
    issues () {
      return allIssues()
    }
  },
  mounted () {
    window.addEventListener('keydown', this.onKey)
  },
  beforeUnmount () {
    window.removeEventListener('keydown', this.onKey)
  },
  methods: {
    volumeLink,
    setDrawer (open) {
      this.drawerOpen = open
      if (!open) this.volumesOpen = false
      this.$emit('drawer', open)
    },
    onKey (e) {
      if (this.drawerOpen && e.key === 'Escape') this.setDrawer(false)
    }
  }
}
</script>

<style scoped>
.site {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  background: #eee;
  color: #111;
  font-family: Helvetica, 'Helvetica Neue', Arial, sans-serif;
}

:where(.site) a,
:where(.site) button {
  color: inherit;
  text-decoration: none;
  font: inherit;
}

.site__bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 1.25rem 2rem;
}

.site__bar.is-solid {
  background: #eee;
}

.site__brand {
  font-weight: 700;
  font-size: 1.75rem;
}

.site__nav {
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  font-size: 1.25rem;
}

.site__explore {
  background: #000;
  color: #fff;
  border: 0;
  border-radius: 0;
  padding: 0.3em 0.7em 0.35em;
  font-weight: 700;
  font-size: 1em;
  cursor: pointer;
}

.site__explore.is-hidden {
  visibility: hidden;
}

.site__explore:hover {
  color: #ff3b30;
}

.site__scroll {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 5.5rem 2rem 4rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.site__backdrop {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 3;
  background: rgba(0, 0, 0, 0.35);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.35s ease, visibility 0s linear 0.35s;
}

.site__backdrop.is-open {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.35s ease;
}

.site__drawer {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 4;
  width: 75vw;
  display: flex;
  flex-direction: column;
  padding: 6rem 2rem 3rem 4rem;
  background: #000;
  color: #fff;
  overflow-y: auto;
  transform: translateX(-100%);
  visibility: hidden;
  transition: transform 0.35s ease, visibility 0s linear 0.35s;
}

.site__drawer.is-open {
  transform: translateX(0);
  visibility: visible;
  transition: transform 0.35s ease;
}

.site__close {
  position: absolute;
  top: 1.1rem;
  right: 2rem;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0 0 0.2em;
  background: none;
  border: 2px solid #000;
  border-radius: 0;
  color: #000;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.35s ease, color 0.2s ease, border-color 0.2s ease, visibility 0s linear 0.35s;
}

.site__close.is-open {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.35s ease, color 0.2s ease, border-color 0.2s ease;
}

.site__close:hover {
  background: #000;
  color: #fff;
}

.site__menu,
.site__sub {
  margin: 0;
  padding: 0;
  list-style: none;
}

.site__menu > li {
  margin-bottom: 0.25rem;
}

.site__menu a,
.site__menu > li > button {
  display: inline-block;
  background: none;
  border: 0;
  padding: 0;
  color: #fff;
  font-weight: 700;
  font-size: 2.5rem;
  line-height: 1.1;
  cursor: pointer;
  transform-origin: left center;
  transition: transform 0.2s ease, color 0.2s ease;
}

.site__menu a:hover,
.site__menu > li > button:hover {
  transform: scale(1.3);
  color: #ff3b30;
}

/* about and submit sit at the bottom, set off from the rest by a white rule. */
.site__foot {
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid #fff;
}

.site__foot > li:last-child {
  margin-bottom: 0;
}

.site__sub {
  margin: 0.75rem 0 0.5rem;
}

.site__sub li {
  margin-bottom: 0.5rem;
}

.site__menu .site__sub a {
  font-size: 1.5rem;
  font-weight: 400;
}

@media (max-width: 40em) {
  .site__bar { padding: 1rem; }
  .site__close { right: 1rem; }
  .site__drawer { padding-left: 2rem; }
  .site__brand { font-size: 1.4rem; }
  .site__nav { font-size: 1.1rem; }
  .site__quick { display: none; }
  .site__scroll { padding: 4.5rem 1rem 3rem; }
}
</style>
