<template>
  <div id="app">
    <router-view/>
    <PageTransition ref="zap" />
  </div>
</template>

<script>
import PageTransition from '@/components/PageTransition.vue'

export default {
  components: { PageTransition },
  data () {
    return {
      baseUrl: import.meta.env.BASE_URL
    }
  },
  created () {
    // Every link click runs the yellow zap: it covers the screen, the route swaps underneath,
    // then it uncovers. The very first page load and same-page clicks are left alone.
    let zapping = false
    this.$router.beforeEach(async (to, from) => {
      const firstLoad = from.matched.length === 0
      if (!firstLoad && to.fullPath !== from.fullPath && this.$refs.zap) {
        zapping = true
        await this.$refs.zap.cover()
      }
    })
    // Also runs when a navigation is cancelled or fails, so the overlay can never get stuck.
    this.$router.afterEach(async () => {
      if (!zapping) return
      zapping = false
      await this.$nextTick()
      this.$refs.zap.reveal()
    })
  }
}
</script>

<style>
*{
  box-sizing: border-box;
  vertical-align: baseline;
}

html{
  overflow-x: hidden;
}

ul, ol {
  list-style: none;
}

html, body, div, span, object, iframe, h1, h2, h3, .splash, .error, h4, h5, h6, p, blockquote, pre, abbr, address, cite, code, del, dfn, em, ins, kbd, q, samp, small, strong, sub, sup, var, b, i, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, figcaption, figure, footer, header, hgroup, menu, nav, section, summary, time, mark, audio, video {
  outline: 0;
  padding: 0;
  border: 0;
  margin: 0;
  background: transparent;
}

::selection {
  color: white;
  background-color: blue;
}

img {
  max-width: 100%;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  position: relative;
}
</style>
