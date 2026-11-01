<template>
  <div class="landing">
    <GrainGradient class="landing__bg" />
    <div class="landing__content">
      <div class="landing__row">
        <h1 class="landing__title"><StretchText label="xjournal" stop-before=".landing__enter" /></h1>
        <router-link class="landing__enter" to="/latest">enter the journal</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import GrainGradient from '@/components/GrainGradient.vue'
import StretchText from '@/components/StretchText.vue'

export default {
  name: 'LandingPage',
  components: { GrainGradient, StretchText }
}
</script>

<style scoped>
/* Full-screen overlay: sits above the site nav so this page is the whole screen. */
.landing {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  overflow: hidden;
  background: #0a0a0a;
}

.landing__bg {
  position: absolute;
  top: 0;
  left: 0;
}

.landing__content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2rem 2rem 3.5rem;
  color: #fff;
}

.landing__row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.landing__title {
  /* Adobe Fonts kit hvf2ttk (linked in index.html): Forager Overlap, bold */
  font-family: 'forager-overlap', Helvetica, 'Helvetica Neue', Arial, sans-serif;
  font-size: 22vw;
  position: relative;
  top: -5px;
  line-height: 0.85;
  font-weight: 700;
  margin: 0;
}

.landing__enter {
  font-family: Helvetica, 'Helvetica Neue', Arial, sans-serif;
  color: #fff;
  position: relative;
  top: -5px;
  font-size: 1.25rem;
  text-decoration: none;
  border-bottom: 1px solid currentColor;
}

.landing__enter:hover,
.landing__enter:focus {
  opacity: 0.7;
}
</style>
