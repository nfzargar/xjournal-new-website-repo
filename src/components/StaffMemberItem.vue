<template>
  <li class="member">
    <span class="member__name">{{ member.name }}</span>
    <span class="member__role">{{ member.role }}</span>
  </li>
</template>

<script>
export default {
  props: {
    member: {
      required: true,
      type: Object
    }
  }
}
</script>

<style scoped>
.member {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 0.6rem 0;
  border-top: 1px solid rgba(0, 0, 0, 0.25);
  font-size: 1.25rem;
  line-height: 1.3;
}

.member__name {
  font-weight: 700;
}

.member__role {
  opacity: 0.6;
}
</style>
