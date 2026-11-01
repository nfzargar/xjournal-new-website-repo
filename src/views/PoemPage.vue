<template>
  <SiteShell scroll issue-id="3">
    <div class="poem">
      <h1 class="poem__title">poem</h1>
      <p class="poem__byline">Lily Lauver, '21</p>
      <p class="poem__hint">click a phrase to hear it</p>
      <Issue3Poem />
      <p class="poem__credit">
        Source text from <em>Tike &amp; Tiny in the Tetons</em> by Frances Joyce Farnsworth
        (University of New Mexico Press, 1954)
      </p>
    </div>
  </SiteShell>
</template>

<script>
import SiteShell from '@/components/SiteShell.vue'
import Issue3Poem from '@/components/Issue3Poem.vue'

export default {
  components: { SiteShell, Issue3Poem }
}
</script>

<style scoped>
.poem {
  max-width: 550px;
  margin: 0 auto;
}

.poem__title {
  margin: 0;
  font-size: clamp(3rem, 12vw, 6rem);
  line-height: 0.9;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.poem__byline {
  margin: 1rem 0 0.25rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #ff3b30;
}

.poem__hint {
  margin: 0 0 2rem;
  opacity: 0.6;
}

.poem__credit {
  margin: 2rem 0 0;
  font-size: 0.9rem;
  line-height: 1.4;
  opacity: 0.6;
}
</style>
