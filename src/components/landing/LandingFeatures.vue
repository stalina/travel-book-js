<template>
  <section ref="sectionRef" class="landing-features">
    <div class="features-container">
      <header class="features-header">
        <h2 class="features-title">Tout ce dont vous avez besoin</h2>
        <p class="features-subtitle">
          Un outil complet pour créer, personnaliser et partager vos albums de voyage
        </p>
      </header>

      <div class="features-grid">
        <BaseCard
          v-for="(feature, index) in features"
          :key="feature.id"
          :ref="(el) => setFeatureRef(el, index)"
          :class="['feature-card', { 'is-visible': visibleIndexes.has(index) }]"
          hoverable
        >
          <div class="feature-icon" :style="{ background: feature.color }">
            {{ feature.icon }}
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </BaseCard>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * LandingFeatures - Grille des 9 fonctionnalités clés
 * 
 * Affiche une grille responsive de cartes présentant les fonctionnalités principales
 * avec animations échelonnées au scroll (Intersection Observer)
 */

import { ref } from 'vue'
import BaseCard from '../BaseCard.vue'
import { useScrollAnimation } from '../../composables/useScrollAnimation'

interface Feature {
  id: string
  icon: string
  title: string
  description: string
  color: string
}

const features: Feature[] = [
  {
    id: 'import',
    icon: '📥',
    title: 'Import Automatique',
    description: 'Importez vos données Polarsteps, GPX ou photos avec géolocalisation en un clic',
    color: 'linear-gradient(135deg, #FF6B6B, #E84545)'
  },
  {
    id: 'edit',
    icon: '✏️',
    title: 'Édition Intuitive',
    description: 'Éditez vos textes, réorganisez vos photos et personnalisez chaque page facilement',
    color: 'linear-gradient(135deg, #4ECDC4, #3DB8AF)'
  },
  {
    id: 'maps',
    icon: '🗺️',
    title: 'Cartes Interactives',
    description: 'Visualisez votre itinéraire complet avec tracé GPS et vignettes géolocalisées',
    color: 'linear-gradient(135deg, #FFE66D, #F7D945)'
  },
  {
    id: 'stats',
    icon: '📊',
    title: 'Statistiques Détaillées',
    description: 'Kilomètres parcourus, pays visités, durée du voyage et bien plus encore',
    color: 'linear-gradient(135deg, #46C93A, #38A62E)'
  },
  {
    id: 'timeline',
    icon: '🕐',
    title: 'Timeline Chronologique',
    description: 'Revivez votre voyage étape par étape avec une timeline interactive synchronisée',
    color: 'linear-gradient(135deg, #4299E1, #3182CE)'
  },
  {
    id: 'photos',
    icon: '🖼️',
    title: 'Galerie Intelligente',
    description: 'Gérez vos photos avec filtres, édition et suggestions IA de mise en page',
    color: 'linear-gradient(135deg, #9F7AEA, #805AD5)'
  },
  {
    id: 'themes',
    icon: '🎨',
    title: 'Thèmes Personnalisables',
    description: 'Choisissez parmi plusieurs thèmes ou créez le vôtre avec vos couleurs',
    color: 'linear-gradient(135deg, #ED64A6, #D53F8C)'
  },
  {
    id: 'export',
    icon: '📄',
    title: 'Export Multi-Format',
    description: 'Téléchargez en PDF, HTML autonome ou mini-site web interactif',
    color: 'linear-gradient(135deg, #F56565, #E53E3E)'
  },
  {
    id: 'privacy',
    icon: '🔒',
    title: '100% Privé',
    description: 'Vos données restent sur votre appareil, aucun upload serveur requis',
    color: 'linear-gradient(135deg, #48BB78, #38A169)'
  }
]

const { elementRef: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.1 })
const visibleIndexes = ref<Set<number>>(new Set())
const featureRefs = ref<(HTMLElement | null)[]>([])

function setFeatureRef(el: any, index: number) {
  if (el?.$el) {
    featureRefs.value[index] = el.$el
  }
}

// Animation échelonnée manuelle
let observer: IntersectionObserver | null = null

if (typeof window !== 'undefined') {
  setTimeout(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = featureRefs.value.indexOf(entry.target as HTMLElement)
            if (index !== -1) {
              setTimeout(() => {
                visibleIndexes.value.add(index)
              }, index * 100)
            }
          }
        })
      },
      { threshold: 0.1 }
    )

    featureRefs.value.forEach((ref) => {
      if (ref && observer) {
        observer.observe(ref)
      }
    })
  }, 100)
}
</script>

<style scoped>
.landing-features {
  padding: var(--spacing-4xl) var(--spacing-xl);
  background: var(--color-background);
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
}

.features-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.features-title {
  font-family: var(--font-family-display);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md);
}

.features-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}

.feature-card {
  opacity: 0;
  transform: translateY(30px);
  transition: all var(--transition-slow);
}

.feature-card.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-lg);
}

.feature-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}

.feature-description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .landing-features {
    padding: var(--spacing-2xl) var(--spacing-md);
  }

  .features-title {
    font-size: var(--font-size-3xl);
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
}
</style>
