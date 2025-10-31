<template>
  <section ref="sectionRef" class="landing-how-it-works">
    <div class="how-it-works-container">
      <header class="how-it-works-header">
        <h2 class="how-it-works-title">Comment ça marche ?</h2>
        <p class="how-it-works-subtitle">
          Créez votre album de voyage en 4 étapes simples
        </p>
      </header>

      <div class="steps-container">
        <div
          v-for="(step, index) in steps"
          :key="step.number"
          :ref="(el) => setStepRef(el, index)"
          :class="['step-card', { 'is-visible': visibleIndexes.has(index) }]"
        >
          <div class="step-number">{{ step.number }}</div>
          <div class="step-content">
            <div class="step-icon">{{ step.icon }}</div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-description">{{ step.description }}</p>
          </div>
          <div v-if="index < steps.length - 1" class="step-arrow">→</div>
        </div>
      </div>

      <div class="cta-footer">
        <BaseButton size="lg" variant="primary" @click="handleGetStarted">
          Commencer maintenant
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * LandingHowItWorks - Section "Comment ça marche"
 * 
 * Affiche les 4 étapes du processus de création d'album
 * avec animations au scroll et flèches de progression
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../BaseButton.vue'

interface Step {
  number: number
  icon: string
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: 1,
    icon: '📥',
    title: 'Importer vos données',
    description: 'Sélectionnez votre dossier Polarsteps, vos fichiers GPX ou vos photos géolocalisées'
  },
  {
    number: 2,
    icon: '🎨',
    title: 'Personnaliser votre album',
    description: 'Éditez les textes, réorganisez les photos, ajustez la mise en page selon vos goûts'
  },
  {
    number: 3,
    icon: '👁️',
    title: 'Prévisualiser le résultat',
    description: 'Visualisez votre album page par page avant la génération finale'
  },
  {
    number: 4,
    icon: '📄',
    title: 'Générer et télécharger',
    description: 'Exportez en PDF haute qualité, HTML autonome ou mini-site web interactif'
  }
]

const router = useRouter()
const visibleIndexes = ref<Set<number>>(new Set())
const stepRefs = ref<HTMLElement[]>([])

function setStepRef(el: any, index: number) {
  if (el) {
    stepRefs.value[index] = el
  }
}

function handleGetStarted() {
  router.push('/home')
}

// Animation échelonnée
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.value.indexOf(entry.target as HTMLElement)
            if (index !== -1) {
              setTimeout(() => {
                visibleIndexes.value.add(index)
              }, index * 150)
            }
          }
        })
      },
      { threshold: 0.2 }
    )

    stepRefs.value.forEach((ref) => {
      if (ref) {
        observer.observe(ref)
      }
    })
  }, 100)
}
</script>

<style scoped>
.landing-how-it-works {
  padding: var(--spacing-4xl) var(--spacing-xl);
  background: var(--color-surface);
}

.how-it-works-container {
  max-width: 1200px;
  margin: 0 auto;
}

.how-it-works-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.how-it-works-title {
  font-family: var(--font-family-display);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md);
}

.how-it-works-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin: 0;
}

.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-3xl);
  position: relative;
}

.step-card {
  position: relative;
  text-align: center;
  opacity: 0;
  transform: translateY(30px);
  transition: all var(--transition-slow);
}

.step-card.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.step-number {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: var(--color-text-inverse);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1;
}

.step-content {
  background: var(--color-background);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl) var(--spacing-xl);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.step-icon {
  font-size: var(--font-size-5xl);
  margin-bottom: var(--spacing-sm);
}

.step-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.step-description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.step-arrow {
  display: none;
}

.cta-footer {
  text-align: center;
}

/* Desktop: afficher flèches entre les étapes */
@media (min-width: 1024px) {
  .steps-container {
    grid-template-columns: repeat(4, 1fr);
  }

  .step-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .step-arrow {
    display: block;
    font-size: var(--font-size-3xl);
    color: var(--color-text-tertiary);
    position: absolute;
    right: -40px;
    top: 50%;
    transform: translateY(-50%);
  }

  .step-card:last-child .step-arrow {
    display: none;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .landing-how-it-works {
    padding: var(--spacing-2xl) var(--spacing-md);
  }

  .how-it-works-title {
    font-size: var(--font-size-3xl);
  }

  .steps-container {
    grid-template-columns: 1fr;
    gap: var(--spacing-2xl);
  }

  .step-content {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
}
</style>
