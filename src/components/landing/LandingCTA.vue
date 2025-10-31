<template>
  <section class="landing-cta">
    <div class="cta-container">
      <h2 class="cta-title">Prêt à créer votre album de voyage ?</h2>
      <p class="cta-subtitle">
        Rejoignez des milliers de voyageurs qui ont déjà créé leur album avec Travel Book
      </p>
      <div class="cta-actions">
        <BaseButton size="lg" variant="primary" @click="handleGetStarted">
          Commencer gratuitement
        </BaseButton>
        <BaseButton size="lg" variant="outline" @click="handleLearnMore">
          En savoir plus
        </BaseButton>
      </div>
      <p class="cta-note">
        Gratuit • Sans inscription • 100% privé
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * LandingCTA - Section Call-To-Action finale
 * 
 * Encourage l'utilisateur à démarrer avec des boutons d'action clairs
 */

import { useRouter } from 'vue-router'
import BaseButton from '../BaseButton.vue'

const router = useRouter()

function handleGetStarted() {
  router.push('/home')
}

function handleLearnMore() {
  // Scroll vers le haut ou rediriger vers une page À propos
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.landing-cta {
  padding: var(--spacing-4xl) var(--spacing-xl);
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-secondary) 100%
  );
  position: relative;
  overflow: hidden;
}

.landing-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

.cta-title {
  font-family: var(--font-family-display);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-inverse);
  margin: 0 0 var(--spacing-lg);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cta-subtitle {
  font-size: var(--font-size-xl);
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 var(--spacing-2xl);
  line-height: var(--line-height-relaxed);
}

.cta-actions {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--spacing-xl);
}

.cta-actions :deep(.variant-outline) {
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-text-inverse);
  border-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.cta-actions :deep(.variant-outline:hover) {
  background: rgba(255, 255, 255, 0.3);
  border-color: var(--color-text-inverse);
}

.cta-note {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: var(--font-weight-medium);
}

/* Responsive */
@media (max-width: 768px) {
  .landing-cta {
    padding: var(--spacing-2xl) var(--spacing-md);
  }

  .cta-title {
    font-size: var(--font-size-3xl);
  }

  .cta-subtitle {
    font-size: var(--font-size-lg);
  }

  .cta-actions {
    flex-direction: column;
    width: 100%;
  }

  .cta-actions :deep(.base-button) {
    width: 100%;
  }
}
</style>
