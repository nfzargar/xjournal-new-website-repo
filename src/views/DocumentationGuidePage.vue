<template>
  <SiteShell scroll>
    <div class="guide">
      <router-link class="guide__back" to="/submit">&larr; submit</router-link>
      <h1 class="guide__title">Guide to Documenting Your Artwork At Home</h1>

      <section v-for="section in sections" :key="section.title" class="guide__section">
        <h2 class="guide__head">{{ section.title }}</h2>
        <ul class="guide__list">
          <li v-for="tip in section.tips" :key="tip">{{ tip }}</li>
        </ul>
      </section>

      <section class="guide__section">
        <h2 class="guide__head">notes</h2>
        <ul class="guide__list">
          <li v-for="note in notes" :key="note">{{ note }}</li>
        </ul>
      </section>
    </div>
  </SiteShell>
</template>

<script>
import SiteShell from '@/components/SiteShell.vue'

const sections = [
  {
    title: 'lighting',
    tips: [
      'The best light is natural light.',
      'Diffused, soft lighting is better than strong direct lighting.',
      'Overcast weather is good for this!',
      'Avoid intense light and strong shadows.',
      'Avoid overhead lights that cast uneven colored light on your work.'
    ]
  },
  {
    title: 'camera',
    tips: [
      'Use a tripod if you have one, otherwise hold the camera as still as possible.',
      'You could also use an object, like a chair, to rest your camera or phone on.',
      'Square up your work with the camera so the image is not skewed.',
      'Works done on paper should be hung using clear tacks or tape on the back.'
    ]
  },
  {
    title: 'background',
    tips: [
      'Give three or four inches of wall space around your piece.',
      'Use a neutral background, like a plain white or gray wall.'
    ]
  },
  {
    title: 'sculpture',
    tips: [
      'Take lots of photos from different angles.',
      'Choose the angles which best represent the piece as a whole.',
      'Avoid distracting backgrounds.'
    ]
  },
  {
    title: 'scanning',
    tips: [
      'Scanners are great for drawings and small paintings.',
      'If you have a scanner, make sure to scan at the highest quality and resolution.'
    ]
  }
]

const notes = [
  'Images with poor lighting will not be considered.',
  'X Journal is a selective publication, not all entries will be accepted.'
]

export default {
  components: { SiteShell },
  data () {
    return {
      sections,
      notes
    }
  }
}
</script>

<style scoped>
.guide {
  max-width: 44rem;
  margin: 0 auto;
}

.guide__back {
  display: inline-block;
  margin-bottom: 1.5rem;
  color: inherit;
  font-weight: 700;
  text-decoration: none;
}

.guide__back:hover {
  color: #ff3b30;
}

.guide__title {
  margin: 0 0 2.5rem;
  font-size: clamp(2.5rem, 8vw, 5rem);
  line-height: 0.95;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.guide__head {
  margin: 2rem 0 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #ff3b30;
}

.guide__list {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 1.25rem;
  line-height: 1.5;
}

.guide__list li {
  padding: 0.35rem 0;
  border-top: 1px solid rgba(0, 0, 0, 0.2);
}
</style>
