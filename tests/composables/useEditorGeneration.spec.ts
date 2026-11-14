import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTripStore } from '../../src/stores/trip.store'
import { useEditorStore } from '../../src/stores/editor.store'
import { useEditorGeneration } from '../../src/composables/useEditorGeneration'
import type { GenerateOptions } from '../../src/services/generate.service'
import type { Trip } from '../../src/models/types'

// We will stub artifactGenerator.generate to simulate a slow generation and assert lock behavior
const { generateMock } = vi.hoisted(() => ({
  generateMock: vi.fn(async () => ({ manifest: {} }))
}))

vi.mock('../../src/services/generate.service', () => {
  return {
    artifactGenerator: {
      generate: generateMock,
      buildSingleFileHtmlString: async (a: any) => '<html></html>'
    }
  }
})

// Pas d'appel réseau pour les altitudes pendant la reconstruction des aperçus d'étape
vi.mock('../../src/services/elevation.service', () => ({
  elevationService: {
    getElevation: async () => null,
    getElevationsBulk: async (locs: unknown[]) => locs.map(() => null)
  }
}))

describe('useEditorGeneration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    generateMock.mockClear()
    delete (window as any).__parsedTrip
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('prevents concurrent preview generations', async () => {
    const tripStore = useTripStore()
    const editorStore = useEditorStore()
    // Create a fake input so generateArtifacts doesn't throw
    tripStore.input = { kind: 'files', files: [] }

    // Mock tripStore.generateArtifacts to simulate a delayed generation and count calls
    let callCount = 0
    vi.spyOn(tripStore, 'generateArtifacts').mockImplementation(async () => {
      callCount++
      // Simulate delay
      await new Promise((r) => setTimeout(r, 50))
      // Provide a minimal artifacts object expected by the generator
      const artifacts = { manifest: {}, files: [], manifestEntries: 0 } as any
      tripStore.artifacts = artifacts
      return artifacts
    })

    const { previewTravelBook } = useEditorGeneration()

    // Fire two preview calls in parallel
    const p1 = previewTravelBook()
    const p2 = previewTravelBook()

    const results = await Promise.all([p1, p2])

    // One of them should have executed generation, the other returned null due to lock
    expect(callCount).toBe(1)
    expect(results.filter(r => r !== null).length).toBe(1)
  })

  it('skips regeneration when preview is not stale and previewHtml exists', async () => {
    const tripStore = useTripStore()
    const editorStore = useEditorStore()

    // Provide existing artifacts and previewHtml
    const artifacts = { manifest: {}, files: [], manifestEntries: 1 } as any
    tripStore.artifacts = artifacts
    editorStore.setPreviewHtml('<html></html>')
    // Mark preview as not stale
    editorStore.isPreviewStale = false

    // Spy on generateArtifacts - it must NOT be called
    const genSpy = vi.spyOn(tripStore, 'generateArtifacts')

    const { previewTravelBook } = useEditorGeneration()

    const result = await previewTravelBook()

  expect(result).toStrictEqual(artifacts)
    expect(genSpy).not.toHaveBeenCalled()
  })

  it('génère l\'aperçu après reprise d\'un brouillon, sans dossier source, avec les données éditées', async () => {
    // Les aperçus d'étape chargent des assets : pas de réseau en test
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 200 })))
    const tripStore = useTripStore()
    const editorStore = useEditorStore()
    expect(tripStore.input).toBeNull()

    const trip: Trip = {
      id: 1,
      name: 'On s\'éclipse !',
      start_date: 1786060800,
      end_date: 1787443200,
      cover_photo: null,
      steps: [
        {
          id: 7,
          name: 'Presque la fin ?',
          slug: 'jasse',
          description: 'Texte modifié',
          start_time: 1787270400,
          lat: 43.9,
          lon: 4.6,
          country: 'France',
          country_code: 'fr',
          weather_condition: 'clear-day',
          weather_temperature: 24
        }
      ]
    }
    const photoMeta = (index: number) => ({
      id: `p${index}`,
      index,
      name: `IMG_${index}.jpg`,
      ratio: 'LANDSCAPE' as const,
      width: 4,
      height: 3,
      orientation: 'landscape' as const,
      fileSize: 3,
      filterPreset: 'original' as const,
      adjustments: { brightness: 0, contrast: 0, saturation: 0, warmth: 0 },
      rotation: 0,
      crop: { ratio: 'original' as const, zoom: 1, offsetX: 0, offsetY: 0 }
    })
    const snapshot = {
      version: 1 as const,
      savedAt: Date.now(),
      trip,
      currentStepIndex: 0,
      // Index 1 supprimée dans l'éditeur : seules les photos 2 et 3 subsistent
      stepPhotosByStep: { 7: [photoMeta(2), photoMeta(3)] },
      stepPageStates: {},
      hiddenStepIds: []
    }
    const blobs = {
      '7-2': new Blob(['two'], { type: 'image/jpeg' }),
      '7-3': new Blob(['three'], { type: 'image/jpeg' })
    }

    await editorStore.restoreFromDraft(snapshot as any, blobs)

    const { previewTravelBook } = useEditorGeneration()
    const result = await previewTravelBook()

    expect(editorStore.previewError).toBeNull()
    expect(result).not.toBeNull()
    expect(editorStore.previewHtml).toBe('<html></html>')
    expect(generateMock).toHaveBeenCalledTimes(1)

    const [input, options] = generateMock.mock.calls[0] as unknown as [unknown, GenerateOptions]
    expect(input).toBeNull()
    expect(options.trip?.name).toBe('On s\'éclipse !')
    expect(options.trip?.steps[0].name).toBe('Presque la fin ?')
    // La copie transmise ne doit pas être l'état réactif de l'éditeur
    expect(options.trip).not.toBe(editorStore.currentTrip)
    const files = options.stepPhotos?.[7] ?? []
    expect(files[0]).toBeUndefined()
    expect(files[1]?.name).toBe('IMG_2.jpg')
    expect(files[2]?.name).toBe('IMG_3.jpg')
  })
})
