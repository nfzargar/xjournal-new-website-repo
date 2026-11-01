import { createRouter, createWebHistory } from 'vue-router'
import SubmissionPage from './views/SubmissionPage.vue'
import DocumentationGuidePage from './views/DocumentationGuidePage.vue'
import sourceData from './data'

// Old per-issue artwork URLs pointed at the nth artwork of an issue (in data.json order).
// Resolve that to the artwork's pageNumber so the volume viewer can open on it.
const pageOfNthArtwork = (issueId, n) => {
  const art = Object.values(sourceData.artworks).filter(a => a.issueId === issueId)[Number(n) - 1]
  return art ? { page: art.pageNumber } : {}
}

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // Every route is matched by specificity in vue-router 4 (see the /issue/N/:view limits below).
  routes: [
    {
      path: '/',
      name: 'LandingPage',
      component: () => import('@/views/LandingPage.vue')
    },
    // Every volume's artwork is viewed in the same viewer.
    {
      path: '/latest',
      name: 'LatestPage',
      component: () => import('@/views/VolumePage.vue')
    },
    {
      path: '/volume/:issueId(\\d+)',
      name: 'VolumePage',
      component: () => import('@/views/VolumePage.vue')
    },
    // Old artwork URLs (these must stay above the /issue/... routes they shadow).
    {
      path: '/issue/:issueIndex(\\d+)/artwork',
      redirect: to => `/volume/${to.params.issueIndex}`
    },
    {
      path: '/issue/:issueIndex(\\d+)/:artworkIndex(\\d+)',
      redirect: to => ({
        path: `/volume/${to.params.issueIndex}`,
        query: pageOfNthArtwork(to.params.issueIndex, to.params.artworkIndex)
      })
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/About.vue')
    },
    // Written pieces and artist lists. These must stay above /issue/:issueIndex.
    {
      path: '/issue/3/poem',
      name: 'PoemPage',
      component: () => import('@/views/PoemPage.vue')
    },
    {
      path: '/issue/:issueIndex(\\d+)/essay',
      name: 'EssayPage',
      props: true,
      component: () => import('@/views/EssayPage.vue')
    },
    {
      path: '/issue/:issueIndex(\\d+)/artists',
      name: 'ArtistsPage',
      props: true,
      component: () => import('@/views/ArtistsPage.vue')
    },
    // Old issue index and issue pages now live in the volume viewer.
    {
      path: '/issues/',
      redirect: '/latest'
    },
    {
      path: '/issue/:issueIndex(\\d+)',
      redirect: to => `/volume/${to.params.issueIndex}`
    },
    {
      path: '/submit',
      name: 'SubmissionPage',
      props: true,
      component: SubmissionPage
    },
    {
      path: '/submit/guide',
      name: 'DocumentationGuidePage',
      props: true,
      component: DocumentationGuidePage
    }
  ],
  scrollBehavior: function (to, from, savePosition) {
    document.getElementById('app').scrollIntoView({ behavior: 'smooth' })

    /* Not sure what all this means, but it causes the app to keep the scroll position
    from previous link, as opposed to starting at the top of each page
    if (to.hash) {
      return {
        selector: to.hash,
        offset: { x: 0, y: 10 }
      }
    }
    */
  }
})
