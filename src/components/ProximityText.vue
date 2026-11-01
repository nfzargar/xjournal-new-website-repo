<template>
  <span ref="root" class="prox">
    <span aria-hidden="true">
      <span v-for="(letter, i) in letters" :key="i" class="prox__letter">{{ letter }}</span>
    </span>
    <span class="prox__sr">{{ label }}</span>
  </span>
</template>

<script>
// Vue 2 port of the "Text Cursor Proximity" effect (21st.dev, danielpetho). Each letter grows and
// shifts colour the closer the cursor is to it. Letters are updated directly on the DOM from one
// pointermove handler (no animation library, nothing reactive per frame), and the text stays a
// normal link/label for clicks, keyboard and screen readers.

const parse = css => {
  const m = css.match(/[\d.]+/g)
  return m ? m.slice(0, 3).map(Number) : [17, 17, 17]
}

const hex = h => {
  const n = parseInt(h.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export default {
  name: 'ProximityText',
  props: {
    label: { type: String, required: true },
    // How far from a letter (px) the cursor still has an effect.
    radius: { type: Number, default: 70 },
    falloff: { type: String, default: 'gaussian' }, // linear | exponential | gaussian
    scale: { type: Number, default: 1.4 },
    // Optional colour to blend towards; by default the text keeps its own colour.
    color: { type: String, default: '' }
  },
  computed: {
    letters () {
      return this.label.split('')
    }
  },
  mounted () {
    this.target = this.color ? hex(this.color) : null
    this.active = false
    this.frame = 0
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
    weight (distance) {
      const t = Math.min(Math.max(1 - distance / this.radius, 0), 1)
      if (this.falloff === 'exponential') return t * t
      if (this.falloff === 'gaussian') return Math.exp(-Math.pow(distance / (this.radius / 2), 2) / 2)
      return t
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
      // Cheap exit when the cursor is nowhere near: reset once, then do nothing.
      const box = root.getBoundingClientRect()
      const margin = this.radius * 2
      const near = this.px > box.left - margin && this.px < box.right + margin &&
        this.py > box.top - margin && this.py < box.bottom + margin
      if (!near) {
        if (this.active) this.reset()
        return
      }
      this.active = true
      const base = this.target ? parse(getComputedStyle(root).color) : null
      const letters = root.querySelectorAll('.prox__letter')
      letters.forEach(el => {
        const r = el.getBoundingClientRect()
        const dx = this.px - (r.left + r.width / 2)
        const dy = this.py - (r.top + r.height / 2)
        const w = this.weight(Math.sqrt(dx * dx + dy * dy))
        el.style.transform = `scale(${1 + (this.scale - 1) * w})`
        if (base) el.style.color = `rgb(${base.map((c, i) => Math.round(c + (this.target[i] - c) * w)).join(',')})`
      })
    },
    reset () {
      this.active = false
      const root = this.$refs.root
      if (!root) return
      root.querySelectorAll('.prox__letter').forEach(el => {
        el.style.transform = ''
        el.style.color = ''
      })
    }
  }
}
</script>

<style scoped>
.prox__letter {
  display: inline-block;
  white-space: pre;
  will-change: transform;
}

.prox__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
