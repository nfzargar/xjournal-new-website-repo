<template>
  <SiteShell scroll>
    <div class="about">
      <h1 class="about__title">about</h1>
      <div class="about__cols">
        <section>
          <h2 class="about__head">information</h2>
          <p class="about__text">
            <strong>x journal</strong> is an annual, visual arts publication created in 2017. x is proud
            to publish, share, and archive the work made by students at knox college.
          </p>
          <p class="about__text">
            contact us at <a class="about__link" href="mailto:xjournal@knox.edu">xjournal@knox.edu</a>
          </p>
        </section>
        <section>
          <h2 class="about__head">legal</h2>
          <p class="about__text">
            <strong>x journal</strong> is a student-run publication from knox college. all works within
            are the intellectual property of the contributor and may not be reproduced without the written
            permission of the creator and journal editorial staff.
          </p>
        </section>
      </div>
      <StaffView />
    </div>
  </SiteShell>
</template>

<script>
import SiteShell from '@/components/SiteShell.vue'
import StaffView from '@/components/StaffView.vue'

export default {
  components: { SiteShell, StaffView }
}
</script>

<style scoped>
.about {
  max-width: 64rem;
  margin: 0 auto;
}

.about__title {
  margin: 0 0 2rem;
  font-size: clamp(3rem, 12vw, 8rem);
  line-height: 0.9;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.about__cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: 2rem 3rem;
  margin-bottom: 4rem;
}

.about__head {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  color: #ff3b30;
}

.about__text {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  line-height: 1.4;
}

.about__link {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.about__link:hover {
  color: #ff3b30;
}
</style>
