<template>
  <div v-if="phase !== 'idle'" class="zap" :class="'zap--' + phase">
    <GrainGradient class="zap__bg" :options="LOOK" />
  </div>
</template>

<script>
// Full-screen yellow grain "zap" that covers the viewport, then wipes away.
// App.vue calls cover() before a route change and reveal() once the new page is in.
import GrainGradient from '@/components/GrainGradient.vue'

const IN_MS = 260
const HOLD_MS = 380
const OUT_MS = 300

// Same shader as the landing page, in yellows (hue/contrast neutral so the yellows stay yellow).
const LOOK = {
  colors: [
    [1, 0.84, 0.32],
    [1, 0.76, 0.14],
    [1, 0.91, 0.52],
    [0.98, 0.7, 0.1]
  ],
  hue: 0,
  contrast: 1.1,
  brightness: 0,
  saturation: 1.05,
  cursorStrength: 0
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

export default {
  name: 'PageTransition',
  components: { GrainGradient },
  data () {
    return { phase: 'idle', LOOK }
  },
  methods: {
    // Resolves once the screen is fully covered and held for a beat.
    async cover () {
      this.phase = 'in'
      await wait(IN_MS + HOLD_MS)
    },
    async reveal () {
      this.phase = 'out'
      await wait(OUT_MS)
      this.phase = 'idle'
    }
  }
}
</script>

<style scoped>
.zap {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  pointer-events: all;
  background: #ffd66b;
}

.zap__bg {
  position: absolute;
  top: 0;
  left: 0;
}

/* Opens from a thin horizontal line like a flash, with a quick flicker on the way in. */
.zap--in {
  animation: zap-in 260ms cubic-bezier(0.7, 0, 0.2, 1) both;
}

.zap--out {
  animation: zap-out 300ms cubic-bezier(0.7, 0, 0.2, 1) both;
}

@keyframes zap-in {
  0% { clip-path: inset(49.5% 0 49.5% 0); filter: brightness(1.25); }
  35% { clip-path: inset(49.5% 0 49.5% 0); filter: brightness(1); }
  50% { filter: brightness(1.15); }
  100% { clip-path: inset(0 0 0 0); filter: brightness(1); }
}

@keyframes zap-out {
  0% { clip-path: inset(0 0 0 0); filter: brightness(1); }
  60% { filter: brightness(1.15); }
  100% { clip-path: inset(49.5% 0 49.5% 0); filter: brightness(1.25); }
}

@media (prefers-reduced-motion: reduce) {
  .zap--in { animation: zap-fade-in 200ms linear both; }
  .zap--out { animation: zap-fade-out 200ms linear both; }
  @keyframes zap-fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes zap-fade-out { from { opacity: 1; } to { opacity: 0; } }
}
</style>
