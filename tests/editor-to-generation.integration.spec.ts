import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEditorStore } from '../src/stores/editor.store'
import type { Trip } from '../src/models/types'
import type { EditorStepPhoto } from '../src/models/editor.types'

describe('Intégration Éditeur → Génération', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const createMockTrip = (): Trip => ({
    id: 1,
    name: 'Test Trip',
    cover_photo: null,
    start_date: 1234567890,
    end_date: 1234654290,
    steps: [
      {
        id: 1,
        name: 'Étape 1',
        slug: 'etape-1',
        description: 'Description originale',
        start_time: 1234567890,
        lat: 48.8566,
        lon: 2.3522,
        country: 'France',
        country_code: 'FR',
        weather_condition: 'sunny',
        weather_temperature: 25
      },
      {
        id: 2,
        name: 'Étape 2',
        slug: 'etape-2',
        description: 'Autre description',
        start_time: 1234654290,
        lat: 41.9028,
        lon: 12.4964,
        country: 'Italy',
        country_code: 'IT',
        weather_condition: 'cloudy',
        weather_temperature: 22
      }
    ]
  })

  const createMockPhoto = (index: number): EditorStepPhoto => ({
    id: `photo-${index}`,
    index,
    url: `data:image/png;base64,photo${index}`,
    ratio: index % 2 === 0 ? 'LANDSCAPE' : 'PORTRAIT',
    name: `Photo ${index}`,
    width: 1920,
    height: 1080,
    orientation: 'landscape',
    fileSize: 1024,
    filterPreset: 'original',
    adjustments: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      warmth: 0
    },
    rotation: 0,
    crop: {
      ratio: 'original',
      zoom: 1,
      offsetX: 0,
      offsetY: 0
    }
  })

  it('buildStepPlan retourne undefined sans état de page initialisé', () => {
    const store = useEditorStore()
    const trip = createMockTrip()
    
    store.setTrip(trip)
    
    // Sans appeler generateDefaultPagesForStep, le plan est undefined
    const plan = store.buildStepPlan(1)
    
    expect(plan).toBeUndefined()
  })

  it('buildStepPlan inclut cover et pages si l\'état est présent', async () => {
    const store = useEditorStore()
    const trip = createMockTrip()
    
    await store.setTrip(trip)
    store.setCurrentStep(0)
    
    // Appeler generateDefaultPagesForStep même sans photos crée un état vide
    await store.generateDefaultPagesForStep(1)
    
    // Avec aucune photo, buildStepPlan retourne undefined (pas de contenu)
    let plan = store.buildStepPlan(1)
    expect(plan).toBeUndefined()
    
    // Ajouter manuellement une page avec photoIndices vides
    store.addPageToCurrentStep('full-page')
    
    // Toujours undefined car aucune photo n'est sélectionnée
    plan = store.buildStepPlan(1)
    expect(plan).toBeUndefined()
  })

  it('buildStepPlan extrait correctement les pages du state', async () => {
    const store = useEditorStore()
    const trip = createMockTrip()
    
    await store.setTrip(trip)
    store.setCurrentStep(0)
    
    await store.generateDefaultPagesForStep(1)
    
    // Ajouter manuellement quelques pages avec des photos fictives
    store.addPageToCurrentStep('full-page')
    const pages = store.currentStepPages
    if (pages.length > 0) {
      const pageId = pages[0].id
      store.setCurrentPagePhotoIndices(pageId, [1, 2])
      
      const plan = store.buildStepPlan(1)
      
      // Le plan doit contenir au moins une page avec des photos
      expect(plan).toBeDefined()
      expect(plan?.pages.length).toBeGreaterThan(0)
      const firstPage = plan?.pages[0]
      if (firstPage && 'photoIndices' in firstPage) {
        // Vérifier que les photoIndices contiennent au moins un indice
        expect(firstPage.photoIndices.length).toBeGreaterThan(0)
        // Les indices doivent être des entiers
        for (const index of firstPage.photoIndices) {
          expect(Number.isInteger(index)).toBe(true)
        }
      }
    }
  })

  it('buildStepPlan gère la photo de couverture', async () => {
    const store = useEditorStore()
    const trip = createMockTrip()
    
    await store.setTrip(trip)
    store.setCurrentStep(0)
    
    await store.generateDefaultPagesForStep(1)
    
    // Définir une photo de couverture
    store.setCurrentStepCoverPhotoIndex(5)
    
    const plan = store.buildStepPlan(1)
    
    // Avec juste une couverture, le plan doit exister
    expect(plan).toBeDefined()
    expect(plan?.cover).toBe(5)
  })

  it('retourne undefined si aucun contenu (pas de couverture ni de photos)', async () => {
    const store = useEditorStore()
    const trip = createMockTrip()
    
    await store.setTrip(trip)
    store.setCurrentStep(0)
    
    // Pas de photos ajoutées
    const plan = store.buildStepPlan(1)
    
    expect(plan).toBeUndefined()
  })
})
