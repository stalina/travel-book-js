import { createRouter, createWebHashHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import HomeView from '../views/HomeView.vue'
import GenerationView from '../views/GenerationView.vue'
import ViewerView from '../views/ViewerView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'landing', component: LandingView },
    { path: '/home', name: 'home', component: HomeView },
    { path: '/generate', name: 'generate', component: GenerationView },
    { path: '/viewer', name: 'viewer', component: ViewerView }
  ]
})

export default router
