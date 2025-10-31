<template>
  <section class="landing-hero">
    <div class="hero-background"></div>
    <div class="hero-content">
      <h1 class="hero-title">Créez de magnifiques albums de voyage</h1>
      <p class="hero-subtitle">
        Transformez vos souvenirs de voyage en un album professionnel, 
        directement depuis votre navigateur
      </p>
      <div class="hero-actions">
        <BaseButton size="lg" variant="primary" @click="handleCreateAlbum">
          Créer mon album
        </BaseButton>
        <BaseButton size="lg" variant="outline" @click="handleViewDemo">
          Voir la démo
        </BaseButton>
      </div>
      <p class="hero-privacy">
        🔒 100% privé et sécurisé - vos données restent sur votre appareil
      </p>
    </div>
    <div class="hero-scroll-indicator">
      <span class="scroll-text">Découvrir</span>
      <div class="scroll-arrow">↓</div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * LandingHero - Section hero de la landing page
 * 
 * Affiche:
 * - Titre principal accrocheur
 * - Sous-titre explicatif
 * - 2 CTA principaux (Créer / Démo)
 * - Message de confidentialité
 * - Indicateur de scroll
 */

import BaseButton from '../BaseButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function handleCreateAlbum() {
  // Rediriger vers la page d'import (actuellement HomeView)
  router.push('/home')
}

function handleViewDemo() {
  // Future: Ouvrir une démo pré-chargée
  // Pour l'instant, rediriger vers viewer avec un album exemple
  router.push('/viewer')
}
</script>

<style scoped>
.landing-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) var(--spacing-xl);
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-secondary) 50%,
    var(--color-accent) 100%
  );
  opacity: 0.1;
  z-index: 0;
}

/* Animation parallaxe légère au scroll */
@media (prefers-reduced-motion: no-preference) {
  .hero-background {
    animation: parallax 20s ease-in-out infinite;
  }
}

@keyframes parallax {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  text-align: center;
  animation: slideInUp 0.8s ease-out;
}

.hero-title {
  font-family: var(--font-family-display);
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg);
}

.hero-subtitle {
  font-size: var(--font-size-xl);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-2xl);
}

.hero-actions {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--spacing-xl);
}

.hero-privacy {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin: 0;
}

.hero-scroll-indicator {
  position: absolute;
  bottom: var(--spacing-2xl);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  opacity: 0.6;
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-10px); }
}

.scroll-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.scroll-arrow {
  font-size: var(--font-size-2xl);
  animation: bounce 1.5s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(10px); }
}

/* Responsive */
@media (max-width: 768px) {
  .landing-hero {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .hero-title {
    font-size: var(--font-size-3xl);
  }

  .hero-subtitle {
    font-size: var(--font-size-lg);
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
  }

  .hero-actions :deep(.base-button) {
    width: 100%;
  }
}
</style>
