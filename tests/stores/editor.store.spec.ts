import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useEditorStore } from '../../src/stores/editor.store'
import type { Trip, Step } from '../../src/models/types'
import { stepProposalService } from '../../src/services/editor/step-proposal.service'
import { StepBuilder } from '../../src/services/builders/step.builder'

const createStep = (overrides: Partial<Step> = {}): Step => ({
  id: 42,
  name: 'Étape principale',
  description: 'Texte initial',
  city: 'Paris',
  country: 'France',
  country_code: 'FR',
  weather_condition: 'Ensoleillé',
  weather_temperature: 18,
  start_time: 1_609_459_200,
  lat: 48.8566,
  lon: 2.3522,
  slug: 'etape-principale',
  ...overrides
})

const createTrip = (overrides: Partial<Trip> = {}): Trip => ({
  id: 7,
  name: 'Roadtrip',
  start_date: 1_609_372_800,
  end_date: 1_609_459_200,
  steps: [createStep()],
  cover_photo: null,
  summary: 'Résumé',
  ...overrides
})

let buildSpy: any
let originalCreateObjectURL: typeof URL.createObjectURL | undefined
let originalCreateImageBitmap: typeof createImageBitmap | undefined

describe('useEditorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    ;(window as any).__parsedTrip = { stepPhotos: {} }
    buildSpy = vi.spyOn(StepBuilder.prototype, 'build').mockResolvedValue('<section>Prévisualisation</section>')
    originalCreateObjectURL = URL.createObjectURL
    originalCreateImageBitmap = globalThis.createImageBitmap as any
    URL.createObjectURL = vi.fn(() => 'blob://test') as any
    ;(globalThis as any).createImageBitmap = vi.fn(async () => ({ width: 1600, height: 900, close: vi.fn() }))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    if (originalCreateObjectURL) {
      URL.createObjectURL = originalCreateObjectURL
    }
    if (originalCreateImageBitmap) {
      ;(globalThis as any).createImageBitmap = originalCreateImageBitmap
    } else {
      delete (globalThis as any).createImageBitmap
    }
  })

  it('génère une proposition et une preview lors du chargement du voyage', async () => {
    const store = useEditorStore()
    const trip = createTrip()

    await store.setTrip(trip)

    expect(store.currentStepProposal).not.toBeNull()
    expect(store.currentStepPreviewHtml).toContain('Prévisualisation')
  })

  it('permet de régénérer une proposition pour l’étape courante', async () => {
    const store = useEditorStore()
    const trip = createTrip()
    const generateSpy = vi.spyOn(stepProposalService, 'generate')

    await store.setTrip(trip)
    generateSpy.mockClear()

    await store.regenerateCurrentStepProposal()

    expect(generateSpy).toHaveBeenCalledTimes(1)
  })

  it('enregistre la proposition validée, met à jour la description et régénère la preview', async () => {
    vi.useFakeTimers()
    const store = useEditorStore()
    const trip = createTrip()

    await store.setTrip(trip)
    buildSpy.mockClear()
    const proposal = store.currentStepProposal
    expect(proposal).not.toBeNull()

    store.acceptCurrentStepProposal()
    vi.runAllTimers()
    await Promise.resolve()

    expect(store.currentStepAcceptedProposal?.generatedAt).toBe(proposal?.generatedAt)
    expect(store.currentStep?.description).toBe(proposal?.description)
    expect(buildSpy).toHaveBeenCalledTimes(1)
  })

  it('initialise un état de pages et permet de configurer couverture, layout et photos', async () => {
    vi.useFakeTimers()
    const store = useEditorStore()
    const trip = createTrip()

    await store.setTrip(trip)
    vi.runAllTimers()
    await Promise.resolve()

    expect(store.currentStepPageState).not.toBeNull()
    expect(store.currentStepPages).toHaveLength(0)
    expect(store.currentStepActivePageId).toBeNull()

    buildSpy.mockClear()

  store.addPageToCurrentStep('grid-2x2')
    const page = store.currentStepPages[0]
    expect(page.layout).toBe('grid-2x2')
    expect(store.currentStepActivePageId).toBe(page.id)

  store.setCurrentPagePhotoIndices(page.id, [1, 1, 2, 3, 3])
    expect(store.currentStepPages[0].photoIndices).toEqual([1, 2, 3])

  store.setCurrentPageLayout(page.id, 'full-page')
  expect(store.currentStepPages[0].layout).toBe('full-page')
  expect(store.currentStepPages[0].photoIndices).toEqual([3])

  store.setCurrentStepCoverPhotoIndex(5)
    expect(store.currentStepPageState?.coverPhotoIndex).toBe(5)

  store.setCurrentStepCoverPhotoIndex(null)
    expect(store.currentStepPageState?.coverPhotoIndex).toBeNull()

    vi.runAllTimers()
    await Promise.resolve()
    expect(buildSpy).toHaveBeenCalledTimes(1)

  store.removePageFromCurrentStep(page.id)
    expect(store.currentStepPages).toHaveLength(0)
    expect(store.currentStepActivePageId).toBeNull()
  })

  it('réordonne les pages et évite les régénérations inutiles', async () => {
    vi.useFakeTimers()
    const store = useEditorStore()
    const trip = createTrip()

    await store.setTrip(trip)
    buildSpy.mockClear()

    store.addPageToCurrentStep('grid-2x2')
    const firstPage = store.currentStepPages[0]
    store.addPageToCurrentStep('hero-plus-2')
    const secondPage = store.currentStepPages[1]

    store.reorderCurrentStepPages([secondPage.id, firstPage.id])
    vi.runAllTimers()
    await Promise.resolve()
    expect(store.currentStepPages[0].id).toBe(secondPage.id)
    expect(buildSpy).toHaveBeenCalledTimes(1)

    buildSpy.mockClear()
    store.reorderCurrentStepPages([secondPage.id, firstPage.id])
    vi.runAllTimers()
    await Promise.resolve()
    expect(buildSpy).not.toHaveBeenCalled()

    store.removePageFromCurrentStep(secondPage.id)
    expect(store.currentStepActivePageId).toBe(firstPage.id)
  })

    it('ajoute une photo à l\'étape et la rend disponible pour la selection', async () => {
      vi.useFakeTimers()
      const store = useEditorStore()
      const trip = createTrip()

      await store.setTrip(trip)
      await Promise.resolve()

      const file = new File(['bar'], 'nouvelle.jpg', { type: 'image/jpeg' })
      const added = await store.addPhotoToCurrentStep(file)
      expect(added?.index).toBeGreaterThan(0)
      expect(store.currentStepPhotos.some((photo) => photo.name === 'nouvelle.jpg')).toBe(true)

      store.addPageToCurrentStep('full-page')
      const page = store.currentStepActivePage
      expect(page).toBeTruthy()
      store.setCurrentPagePhotoIndices(page!.id, [added!.index])
      vi.runAllTimers()
      await Promise.resolve()
      expect(buildSpy).toHaveBeenCalled()
    })

    it('applique des ajustements photo et conserve l\'historique', async () => {
      vi.useFakeTimers()
      const store = useEditorStore()
      const photoFile = new File(['foo'], 'photo-1.jpg', { type: 'image/jpeg' })
      ;(window as any).__parsedTrip.stepPhotos[42] = [photoFile]
      const trip = createTrip()

      await store.setTrip(trip)
      await flushAllPromises()

      const photo = store.currentStepPhotos[0]
      expect(photo).toBeTruthy()

      const snapshot = {
        filterPreset: 'vivid' as const,
        adjustments: { brightness: 15, contrast: 5, saturation: 10, warmth: -5 },
        rotation: 45,
        crop: { ratio: '4:3' as const, zoom: 1.3, offsetX: 5, offsetY: -3 }
      }

      const previous = {
        filterPreset: photo.filterPreset,
        adjustments: { ...photo.adjustments },
        rotation: photo.rotation,
        crop: { ...photo.crop }
      }

      store.applyAdjustmentsToCurrentPhoto(photo.index, snapshot, { past: [previous], future: [] })
      vi.runAllTimers()
      await Promise.resolve()

      const updated = store.currentStepPhotos[0]
      expect(updated.filterPreset).toBe('vivid')
      expect(updated.rotation).toBe(45)
      expect(updated.adjustments.brightness).toBe(15)

      const history = store.getCurrentStepPhotoHistory(photo.index)
      expect(history.past).toHaveLength(1)
      expect(history.past[0].filterPreset).toBe(previous.filterPreset)
      expect(buildSpy).toHaveBeenCalledTimes(1)
    })
})

  const flushAllPromises = async () => {
    await Promise.resolve()
    await Promise.resolve()
  }
