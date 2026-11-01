<template>
  <article class="essay">
    <h1 class="essay__title">{{ essayData.title }}</h1>
    <p class="essay__byline">
      {{ essayData.author }}<span v-if="essayData.graduationYear">, '{{ essayData.graduationYear }}</span>
    </p>
    <div class="essay__body">
      <p v-for="(p, i) in paragraphs" :key="i" class="essay__p">
        <strong v-if="p.sub" class="essay__sub">{{ p.sub }}</strong>
        {{ p.text }}
      </p>
    </div>
  </article>
</template>

<script>
import sourceData from '@/data'

export default {
  props: {
    issue: {
      required: true,
      type: String
    }
  },
  computed: {
    essayData () {
      return sourceData.essays[this.issue]
    },
    // A paragraph's optional second line (after a newline) is its subhead.
    paragraphs () {
      return this.essayData.paragraphs.map(p => {
        const [text, sub] = p.split('\n')
        return { text, sub }
      })
    }
  }
}
</script>

<style scoped>
.essay {
  max-width: 44rem;
  margin: 0 auto;
}

.essay__title {
  margin: 0;
  font-size: clamp(2.5rem, 8vw, 5.5rem);
  line-height: 0.95;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.essay__byline {
  margin: 1rem 0 3rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #ff3b30;
}

.essay__p {
  margin: 0 0 1.5rem;
  font-size: 1.25rem;
  line-height: 1.55;
}

.essay__sub {
  display: block;
  margin-bottom: 0.25rem;
}
</style>
