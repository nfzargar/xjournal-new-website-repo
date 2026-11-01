<template>
  <SiteShell scroll>
    <div class="submit">
      <h1 class="submit__title">submit</h1>

      <div class="submit__grid">
        <section class="submit__main">
          <h2 class="submit__head">physical work</h2>
          <p class="submit__text">
            physical work can be submitted in WAC, on the second floor, near the open studios.
            <em>(we photograph physical submissions.)</em>
          </p>

          <h2 class="submit__head">digital work</h2>
          <p class="submit__text submit__text--strong">
            only submit your work online if it is a digital work, or a high resolution photo of your work in
            the correct format.
          </p>
          <p class="submit__text">
            to submit online, first review our
            <router-link class="submit__link" to="/submit/guide">guide for documenting your own work</router-link>,
            then send your work through the form.
          </p>
          <a class="submit__button" target="_blank" rel="noopener" :href="formUrl">open the submission form</a>

          <h2 class="submit__head">timeline</h2>
          <p class="submit__text">submissions will close in April in Spring Term 2026.</p>
          <p class="submit__text">issue 8 will be released later in 2026.</p>

          <h2 class="submit__head">questions</h2>
          <p class="submit__text">
            please send questions to
            <a class="submit__link" href="mailto:xjournal@knox.edu">xjournal@knox.edu</a>.
          </p>
        </section>

        <section class="submit__accept">
          <h2 class="submit__head">we accept</h2>
          <ul class="submit__list">
            <li v-for="item in accepted" :key="item">{{ item }}</li>
          </ul>
          <p class="submit__text submit__note">
            does your work not fit any of that? if your work is visual, we'd like to see it.
          </p>
        </section>
      </div>
    </div>
  </SiteShell>
</template>

<script>
import SiteShell from '@/components/SiteShell.vue'

const accepted = [
  'animation', 'ceramics', 'costumes', 'dance', 'graphic design', 'drawing',
  'illustration', 'mixed media', 'new media', 'painting', 'performance', 'printmaking',
  'photography', 'sculpture', 'set design', 'textiles', 'typography', 'video'
]

export default {
  components: { SiteShell },
  data () {
    return {
      accepted,
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScmRm2hGl4PmX0FFZNW1C6nDzhxOI7zs4Lmnw-9abQV_Tz8pQ/viewform'
    }
  }
}
</script>

<style scoped>
.submit {
  max-width: 64rem;
  margin: 0 auto;
}

.submit__title {
  margin: 0 0 2.5rem;
  font-size: clamp(3rem, 12vw, 8rem);
  line-height: 0.9;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.submit__grid {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: 2rem 4rem;
  align-items: start;
}

.submit__head {
  margin: 2.5rem 0 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #ff3b30;
}

.submit__main > .submit__head:first-child,
.submit__accept > .submit__head:first-child {
  margin-top: 0;
}

.submit__text {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  line-height: 1.4;
}

.submit__text--strong {
  font-weight: 700;
}

.submit__link {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.submit__link:hover {
  color: #ff3b30;
}

.submit__button {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.5em 1em 0.55em;
  background: #000;
  color: #fff;
  border-radius: 0;
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
}

.submit__button:hover {
  opacity: 0.8;
}

.submit__list {
  margin: 0 0 1.5rem;
  padding: 0;
  list-style: none;
  columns: 2;
  font-size: 1.25rem;
  line-height: 1.5;
}

.submit__note {
  opacity: 0.6;
}

@media (max-width: 50em) {
  .submit__grid { grid-template-columns: 1fr; }
}
</style>
