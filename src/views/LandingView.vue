<template>
  <div class="landing-view">
    <LandingHero />
    <LandingFeatures />
    <LandingHowItWorks />
    <LandingCTA />
    
    <footer class="landing-footer">
      <div class="footer-container">
        <p class="footer-text">
          © {{ currentYear }} Travel Book - Créé avec ❤️ pour les voyageurs
        </p>
        <nav class="footer-links">
          <router-link to="/privacy" class="footer-link">Politique de confidentialité</router-link>
          <a href="#" class="footer-link" @click.prevent="scrollToTop">Retour en haut ↑</a>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * LandingView - Page d'accueil principale (Landing Page)
 * 
 * Vue qui orchestre tous les composants de la landing page:
 * - LandingHero: Section hero avec CTA
 * - LandingFeatures: Grille des 9 fonctionnalités
 * - LandingHowItWorks: 4 étapes du processus
 * - LandingCTA: Call-to-action final
 * - Footer: Pied de page
 */

import { computed, onMounted } from 'vue'
import LandingHero from '../components/landing/LandingHero.vue'
import LandingFeatures from '../components/landing/LandingFeatures.vue'
import LandingHowItWorks from '../components/landing/LandingHowItWorks.vue'
import LandingCTA from '../components/landing/LandingCTA.vue'
import { analyticsService, AnalyticsEvent } from '../services/analytics.service'

const currentYear = computed(() => new Date().getFullYear())

onMounted(() => {
  // Track landing page view avec la source de trafic
  const trafficSource = analyticsService.getTrafficSource()
  analyticsService.trackPageView('landing', { source: trafficSource })
  analyticsService.trackEvent(AnalyticsEvent.LANDING_VIEW, { referrer: trafficSource })
})

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.landing-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.landing-footer {
  background: var(--color-text-primary);
  color: var(--color-text-inverse);
  padding: var(--spacing-xl) var(--spacing-xl);
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.footer-text {
  font-size: var(--font-size-sm);
  margin: 0;
  opacity: 0.8;
}

.footer-links {
  display: flex;
  gap: var(--spacing-lg);
}

.footer-link {
  color: var(--color-text-inverse);
  text-decoration: none;
  font-size: var(--font-size-sm);
  opacity: 0.8;
  transition: opacity var(--transition-base);
}

.footer-link:hover {
  opacity: 1;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    text-align: center;
  }
}
</style>
