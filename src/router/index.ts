import { createRouter, createWebHashHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import HomeView from '../views/HomeView.vue'
import EditorView from '../views/EditorView.vue'
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import { analyticsService } from '../services/analytics.service'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'landing', component: LandingView },
    { path: '/home', name: 'home', component: HomeView },
    { path: '/editor', name: 'editor', component: EditorView },
    { path: '/privacy', name: 'privacy', component: PrivacyPolicyView }
  ]
})

// Tracker les vues de pages
router.afterEach((to) => {
  const pageName = to.name?.toString() || 'unknown'
  analyticsService.trackPageView(pageName, to.meta.title as string)
})

export default router
