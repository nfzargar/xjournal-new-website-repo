<template>
  <span ref="root" class="stretch">
    <span class="stretch__sr">{{ label }}</span>
    <span aria-hidden="true">
      <span v-for="(letter, i) in letters" :key="i" class="stretch__letter">{{ letter }}</span>
    </span>
  </span>
</template>

<script>
// Hover-to-stretch headline. The letter whose centre is closest to the mouse widens, and the
// letters after it slide right to make room, up to the left edge of the `stopBefore` element
// (so a link beside the headline is never covered). Moving the mouse to another letter moves the
// stretch there; leaving the word eases everything back.
//
// A letter widens with scaleX (origin left) plus an equal margin-right, so the glyph stretches and
// the neighbours are pushed along. The closest letter is chosen from the letters' current on-screen
// centres, but a stretched letter keeps the stretch while the mouse is over it.

const REACH = 0.9 // how far from a letter centre (in font sizes) the mouse still counts

export default {
  name: 'StretchText',
  props: {
    label: { type: String, required: true },
    // CSS selector of the element the stretch must stop short of.
    stopBefore: { type: String, default: '' },
    // Breathing room kept between the stretched word and that element (px).
    gap: { type: Number, default: 24 },
    // No letter is stretched past this many times its natural width (the stop element usually
    // limits it first; lower this if very narrow letters look too wide).
    maxStretch: { type: Number, default: 6 },
    // From above, a letter only reacts once the mouse is within this many px of the top of the
    // letter itself (its visible top, not the line box). The other sides are unaffected.
    topReach: { type: Number, default: 5 }
  },
  computed: {
    letters () {
      return this.label.split('')
    }
  },
  mounted () {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.enabled = finePointer && !reduced
    this.active = -1
    this.frame = 0
    if (!this.enabled) return
    window.addEventListener('pointermove', this.onMove, { passive: true })
    window.addEventListener('blur', this.reset)
    document.documentElement.addEventListener('pointerleave', this.reset)
  },
  beforeUnmount () {
    window.removeEventListener('pointermove', this.onMove)
    window.removeEventListener('blur', this.reset)
    document.documentElement.removeEventListener('pointerleave', this.reset)
    cancelAnimationFrame(this.frame)
  },
  methods: {
    els () {
      return this.$refs.root.querySelectorAll('.stretch__letter')
    },
    onMove (e) {
      this.px = e.clientX
      this.py = e.clientY
      if (!this.frame) this.frame = requestAnimationFrame(this.update)
    },
    update () {
      this.frame = 0
      const root = this.$refs.root
      if (!root) return
      const els = this.els()
      const fontSize = parseFloat(getComputedStyle(root).fontSize) || 100

      const rects = [...els].map(el => el.getBoundingClientRect())
      const style = getComputedStyle(root)
      // Each letter's own visible top, so the mouse above a short letter (x, o, u...) has to come
      // down to that letter, not to the top of the tall one next to it.
      const tops = [...els].map((el, i) => this.glyphTop(el, rects[i], style))

      // The top rule: whichever letter the mouse is directly above (or the end letter when it is
      // out past the left/right end), it must be within `topReach` px of that letter's top before
      // anything reacts. Only the top is limited; the other sides work as before.
      let column = rects.findIndex(r => this.px >= r.left && this.px <= r.right)
      if (column < 0) column = this.px < rects[0].left ? 0 : rects.length - 1
      if (this.py < tops[column] - this.topReach) return this.show(-1)

      // Stay on the stretched letter for as long as the mouse is anywhere over it. (Its centre
      // sits well to the right of where the mouse entered, so "nearest centre" alone would hand
      // the stretch back to a neighbour and the two would flip back and forth.)
      const cur = this.active >= 0 ? rects[this.active] : null
      if (cur && this.px >= cur.left && this.px <= cur.right && this.py >= cur.top && this.py <= cur.bottom) {
        return this.show(this.active)
      }

      // Otherwise the letter whose centre is closest to the mouse.
      let nearest = 0
      let best = Infinity
      rects.forEach((r, i) => {
        const d = Math.hypot(this.px - (r.left + r.width / 2), this.py - (r.top + r.height / 2))
        if (d < best) { best = d; nearest = i }
      })
      this.show(best > REACH * fontSize ? -1 : nearest)
    },
    // Where the visible top of a letter's glyph is, in viewport px. The letter box is a line box
    // (line-height < 1), so work from the font's own ascent: the content area is centred in the box.
    glyphTop (el, rect, style) {
      if (!this.ctx) this.ctx = document.createElement('canvas').getContext('2d')
      this.ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
      const m = this.ctx.measureText(el.textContent)
      const content = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent
      const baseline = rect.top + (rect.height - content) / 2 + m.fontBoundingBoxAscent
      return baseline - m.actualBoundingBoxAscent
    },
    // How much extra width the word may take: from where it ends at rest to the stop element.
    freeSpace (els) {
      const stop = this.stopBefore && document.querySelector(this.stopBefore)
      if (!stop) return 0
      const left = els[0].getBoundingClientRect().left
      const restRight = left + [...els].reduce((sum, el) => sum + el.offsetWidth, 0)
      return Math.max(0, stop.getBoundingClientRect().left - this.gap - restRight)
    },
    show (index) {
      this.active = index
      const els = this.els()
      const free = index >= 0 ? this.freeSpace(els) : 0
      els.forEach((el, i) => {
        const natural = el.offsetWidth
        const s = i === index ? Math.min(this.maxStretch, 1 + free / Math.max(natural, 1)) : 1
        el.style.transform = s === 1 ? '' : `scaleX(${s})`
        el.style.marginRight = s === 1 ? '' : `${(s - 1) * natural}px`
      })
    },
    reset () {
      this.px = this.py = -9999
      if (this.active !== -1 || this.$refs.root) this.show(-1)
    }
  }
}
</script>

<style scoped>
.stretch {
  white-space: nowrap;
}

.stretch__letter {
  display: inline-block;
  transform-origin: left center;
  transition: transform 0.35s cubic-bezier(0.2, 0.7, 0.2, 1), margin-right 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.stretch__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
