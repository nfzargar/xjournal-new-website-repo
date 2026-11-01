<template>
  <section class="staff">
    <div class="staff__head">
      <h2 class="staff__title">staff</h2>
      <div class="staff__years" role="tablist">
        <button
          v-for="y in years"
          :key="y"
          type="button"
          role="tab"
          class="staff__year"
          :class="{ 'is-active': y === year }"
          :aria-selected="String(y === year)"
          @click="year = y">{{ y }}</button>
      </div>
    </div>
    <ul class="staff__list">
      <StaffMemberItem v-for="member in staff" :key="member.name" :member="member" />
    </ul>
  </section>
</template>

<script>
import sourceData from '@/data'
import StaffMemberItem from '@/components/StaffMemberItem.vue'

const years = Object.keys(sourceData.staff).map(Number).sort((a, b) => a - b)

export default {
  components: { StaffMemberItem },
  data () {
    return { years, year: years[years.length - 1] }
  },
  computed: {
    staff () {
      return sourceData.staff[this.year].staff
    }
  }
}
</script>

<style scoped>
.staff__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 1rem 2rem;
  margin-bottom: 1.5rem;
}

.staff__title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.staff__years {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.staff__year {
  background: none;
  border: 2px solid #000;
  border-radius: 0;
  padding: 0.2em 0.7em;
  color: #000;
  font: inherit;
  font-size: 1rem;
  cursor: pointer;
}

.staff__year:hover,
.staff__year.is-active {
  background: #000;
  color: #fff;
}

.staff__list {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
