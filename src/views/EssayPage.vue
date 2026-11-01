<template>
  <SiteShell scroll :issue-id="issueIndex">
    <Essay v-if="issue && issue.essayId" :issue="issue.essayId" />
    <p v-else class="essay-empty">No essay in x{{ issueIndex }}.</p>
  </SiteShell>
</template>

<script>
import SiteShell from '@/components/SiteShell.vue'
import Essay from '@/components/Essay.vue'
import sourceData from '@/data'

export default {
  components: { SiteShell, Essay },
  props: {
    issueIndex: {
      required: true,
      type: String
    }
  },
  computed: {
    issue () {
      return sourceData.issues[this.issueIndex]
    }
  }
}
</script>

<style scoped>
.essay-empty {
  margin: 0;
  padding-top: 20vh;
  text-align: center;
}
</style>
