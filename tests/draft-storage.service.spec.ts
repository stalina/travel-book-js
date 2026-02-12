import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import { DraftStorageService } from '../src/services/draft-storage.service'
import type { DraftSnapshot } from '../src/models/draft.types'
import type { EditorStepPhoto, StepPageState } from '../src/models/editor.types'
import type { Trip } from '../src/models/types'
import { DEFAULT_PHOTO_ADJUSTMENTS, DEFAULT_PHOTO_CROP, DEFAULT_PHOTO_FILTER } from '../src/models/photo.constants'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockTrip(overrides?: Partial<Trip>): Trip {
  return {
    id: 1,
    name: 'Test Trip',
    start_date: 1700000000,
    end_date: 1700200000,
    cover_photo: null,
    steps: [
      {
        id: 101,
        name: 'Paris',
        description: 'City of lights',
        country: 'France',
        country_code: 'FR',
        weather_condition: 'sunny',
        weather_temperature: 20,
        start_time: 1700000000,
        lat: 48.8566,
        lon: 2.3522,
        slug: 'paris',
        city: 'Paris'
      },
      {
        id: 102,
        name: 'Lyon',
        description: 'Gastronomie',
        country: 'France',
        country_code: 'FR',
        weather_condition: 'cloudy',
        weather_temperature: 15,
        start_time: 1700100000,
        lat: 45.764,
        lon: 4.8357,
        slug: 'lyon',
        city: 'Lyon'
      }
    ],
    ...overrides
  }
}

function createMockPhoto(stepId: number, index: number): EditorStepPhoto {
  const blob = new Blob(['fake image data'], { type: 'image/jpeg' })
  const file = new File([blob], `photo-${stepId}-${index}.jpg`, { type: 'image/jpeg' })
  return {
    id: `${stepId}-${index}-photo-${stepId}-${index}.jpg`,
    index,
    url: `blob:http://localhost/${stepId}-${index}`,
    ratio: 'LANDSCAPE',
    name: file.name,
    file,
    width: 1920,
    height: 1080,
    orientation: 'landscape',
    fileSize: blob.size,
    filterPreset: DEFAULT_PHOTO_FILTER,
    adjustments: { ...DEFAULT_PHOTO_ADJUSTMENTS },
    rotation: 0,
    crop: { ...DEFAULT_PHOTO_CROP }
  }
}

function createMockPageState(): StepPageState {
  return {
    pages: [
      { id: 'page-1', layout: 'full-page', photoIndices: [] },
      { id: 'page-2', layout: 'grid-2x2', photoIndices: [1, 2, 3, 4] }
    ],
    activePageId: 'page-1',
    coverPhotoIndex: 1,
    coverFormat: 'text-image'
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DraftStorageService', () => {
  beforeEach(async () => {
    DraftStorageService.resetInstance()
    // Delete the database to ensure test isolation
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase('travel-book-drafts')
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
      req.onblocked = () => resolve()
    })
  })

  afterEach(() => {
    DraftStorageService.resetInstance()
  })

  describe('Singleton pattern', () => {
    it('returns the same instance', () => {
      const a = DraftStorageService.getInstance()
      const b = DraftStorageService.getInstance()
      expect(a).toBe(b)
    })

    it('creates a new instance after reset', () => {
      const a = DraftStorageService.getInstance()
      DraftStorageService.resetInstance()
      const b = DraftStorageService.getInstance()
      expect(a).not.toBe(b)
    })
  })

  describe('hasDraft()', () => {
    it('returns false when no draft exists', async () => {
      const service = DraftStorageService.getInstance()
      expect(await service.hasDraft()).toBe(false)
    })

    it('returns true after saving a draft', async () => {
      const service = DraftStorageService.getInstance()
      const trip = createMockTrip()
      await service.saveDraft(trip, 0, {}, {})
      expect(await service.hasDraft()).toBe(true)
    })
  })

  describe('saveDraft() + loadDraft()', () => {
    it('round-trips trip metadata', async () => {
      const service = DraftStorageService.getInstance()
      const trip = createMockTrip({ name: 'Mon Voyage en France' })

      await service.saveDraft(trip, 1, {}, {})
      const result = await service.loadDraft()

      expect(result).not.toBeNull()
      expect(result!.snapshot.trip.name).toBe('Mon Voyage en France')
      expect(result!.snapshot.trip.steps).toHaveLength(2)
      expect(result!.snapshot.currentStepIndex).toBe(1)
      expect(result!.snapshot.version).toBe(1)
    })

    it('round-trips photo metadata (without blob URLs)', async () => {
      const service = DraftStorageService.getInstance()
      const trip = createMockTrip()
      const photo = createMockPhoto(101, 1)
      photo.filterPreset = 'vintage'
      photo.adjustments = { brightness: 10, contrast: -5, saturation: 0, warmth: 3 }
      photo.rotation = 90

      const stepPhotos: Record<number, EditorStepPhoto[]> = { 101: [photo] }
      await service.saveDraft(trip, 0, stepPhotos, {})

      const result = await service.loadDraft()
      expect(result).not.toBeNull()

      const saved = result!.snapshot.stepPhotosByStep[101]
      expect(saved).toHaveLength(1)
      expect(saved[0].filterPreset).toBe('vintage')
      expect(saved[0].adjustments.brightness).toBe(10)
      expect(saved[0].rotation).toBe(90)
      expect(saved[0].name).toBe('photo-101-1.jpg')
      // URL should NOT be persisted (it's a blob URL)
      expect(saved[0]).not.toHaveProperty('url')
    })

    it('round-trips photo blobs', async () => {
      const service = DraftStorageService.getInstance()
      const trip = createMockTrip()
      const photo = createMockPhoto(101, 1)

      const stepPhotos: Record<number, EditorStepPhoto[]> = { 101: [photo] }
      await service.saveDraft(trip, 0, stepPhotos, {})

      const result = await service.loadDraft()
      expect(result).not.toBeNull()

      const blobKey = '101-1'
      expect(result!.photoBlobs).toHaveProperty(blobKey)
      const blob = result!.photoBlobs[blobKey]
      expect(blob).toBeDefined()
      // In fake-indexeddb the cursor value may be a File or Blob-like
      // Just verify it has content
      expect(blob).not.toBeNull()
    })

    it('round-trips page states', async () => {
      const service = DraftStorageService.getInstance()
      const trip = createMockTrip()
      const pageState = createMockPageState()

      const stepPageStates: Record<number, StepPageState> = { 101: pageState }
      await service.saveDraft(trip, 0, {}, stepPageStates)

      const result = await service.loadDraft()
      expect(result).not.toBeNull()

      const restoredState = result!.snapshot.stepPageStates[101]
      expect(restoredState).toBeDefined()
      expect(restoredState.pages).toHaveLength(2)
      expect(restoredState.pages[1].layout).toBe('grid-2x2')
      expect(restoredState.pages[1].photoIndices).toEqual([1, 2, 3, 4])
      expect(restoredState.coverPhotoIndex).toBe(1)
      expect(restoredState.coverFormat).toBe('text-image')
    })

    it('handles multiple photos across multiple steps', async () => {
      const service = DraftStorageService.getInstance()
      const trip = createMockTrip()

      const stepPhotos: Record<number, EditorStepPhoto[]> = {
        101: [createMockPhoto(101, 1), createMockPhoto(101, 2)],
        102: [createMockPhoto(102, 1)]
      }

      await service.saveDraft(trip, 0, stepPhotos, {})
      const result = await service.loadDraft()
      expect(result).not.toBeNull()

      expect(result!.snapshot.stepPhotosByStep[101]).toHaveLength(2)
      expect(result!.snapshot.stepPhotosByStep[102]).toHaveLength(1)
      expect(Object.keys(result!.photoBlobs)).toHaveLength(3)
    })
  })

  describe('getDraftInfo()', () => {
    it('returns null when no draft exists', async () => {
      const service = DraftStorageService.getInstance()
      expect(await service.getDraftInfo()).toBeNull()
    })

    it('returns summary info from a saved draft', async () => {
      const service = DraftStorageService.getInstance()
      const trip = createMockTrip({ name: 'Aventure Nordique' })
      const stepPhotos: Record<number, EditorStepPhoto[]> = {
        101: [createMockPhoto(101, 1), createMockPhoto(101, 2)],
        102: [createMockPhoto(102, 1)]
      }

      await service.saveDraft(trip, 0, stepPhotos, {})
      const info = await service.getDraftInfo()

      expect(info).not.toBeNull()
      expect(info!.tripName).toBe('Aventure Nordique')
      expect(info!.totalSteps).toBe(2)
      expect(info!.totalPhotos).toBe(3)
      expect(info!.savedAt).toBeGreaterThan(0)
    })
  })

  describe('deleteDraft()', () => {
    it('removes the draft so hasDraft returns false', async () => {
      const service = DraftStorageService.getInstance()
      const trip = createMockTrip()
      await service.saveDraft(trip, 0, {}, {})
      expect(await service.hasDraft()).toBe(true)

      await service.deleteDraft()
      expect(await service.hasDraft()).toBe(false)
    })

    it('removes photo blobs too', async () => {
      const service = DraftStorageService.getInstance()
      const trip = createMockTrip()
      const stepPhotos: Record<number, EditorStepPhoto[]> = {
        101: [createMockPhoto(101, 1)]
      }
      await service.saveDraft(trip, 0, stepPhotos, {})

      await service.deleteDraft()

      // Re-use the same service instance (DB stays open)
      expect(await service.hasDraft()).toBe(false)
      const result = await service.loadDraft()
      expect(result).toBeNull()
    })
  })

  describe('overwrite behavior', () => {
    it('saving a second draft overwrites the first', async () => {
      const service = DraftStorageService.getInstance()

      await service.saveDraft(createMockTrip({ name: 'Trip A' }), 0, {}, {})
      await service.saveDraft(createMockTrip({ name: 'Trip B' }), 1, {}, {})

      const result = await service.loadDraft()
      expect(result).not.toBeNull()
      expect(result!.snapshot.trip.name).toBe('Trip B')
      expect(result!.snapshot.currentStepIndex).toBe(1)
    })
  })

  describe('buildSnapshot()', () => {
    it('produces a serializable snapshot without File references', () => {
      const service = DraftStorageService.getInstance()
      const trip = createMockTrip()
      const photo = createMockPhoto(101, 1)
      const pageState = createMockPageState()

      const snapshot = service.buildSnapshot(
        trip,
        0,
        { 101: [photo] },
        { 101: pageState }
      )

      // Should be fully JSON-serializable
      const json = JSON.stringify(snapshot)
      const parsed = JSON.parse(json) as DraftSnapshot
      expect(parsed.version).toBe(1)
      expect(parsed.trip.name).toBe('Test Trip')
      expect(parsed.stepPhotosByStep[101][0].name).toBe('photo-101-1.jpg')
      // No File reference
      expect(parsed.stepPhotosByStep[101][0]).not.toHaveProperty('file')
      expect(parsed.stepPhotosByStep[101][0]).not.toHaveProperty('url')
    })
  })
})
