import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/design-system.css'
import { analyticsService } from './services/analytics.service'

// Initialiser Analytics
analyticsService.initialize()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
