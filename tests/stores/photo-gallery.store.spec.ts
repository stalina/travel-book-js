import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePhotoGalleryStore, type GalleryViewMode } from '../../src/stores/photo-gallery.store'
import type { GalleryPhoto } from '../../src/models/gallery.types'
import { buildCssFilter } from '../../src/utils/photo-filters'

const createPhoto = (overrides: Partial<GalleryPhoto> = {}): GalleryPhoto => {
  const file = new File(['mock'], overrides.file?.name ?? 'photo.jpg', { type: 'image/jpeg' })
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    stepId: overrides.stepId ?? 1,
    stepName: overrides.stepName ?? 'Paris',
    stepDate: overrides.stepDate ?? 1_700_000_000,
    location: overrides.location ?? 'Paris · France',
    countryCode: overrides.countryCode ?? 'FR',
    tags: overrides.tags ?? ['step:paris', 'pays:fr', 'orientation:landscape'],
    file,
    objectUrl: overrides.objectUrl ?? 'blob:mock',
    width: overrides.width ?? 1600,
    height: overrides.height ?? 900,
    orientation: overrides.orientation ?? 'landscape',
    fileSize: overrides.fileSize ?? 2_000_000,
    filterPreset: overrides.filterPreset ?? 'original',
    adjustments: overrides.adjustments ?? { brightness: 0, contrast: 0, saturation: 0, warmth: 0 },
    crop: overrides.crop ?? { ratio: 'original', zoom: 1, offsetX: 0, offsetY: 0 },
    rotation: overrides.rotation ?? 0,
    aiFavoriteScore: overrides.aiFavoriteScore ?? 0.7,
    aiFavorite: overrides.aiFavorite ?? true,
    customFavorite: overrides.customFavorite ?? false,
    hidden: overrides.hidden ?? false,
    qualityInsights: overrides.qualityInsights ?? [],
    palette: overrides.palette ?? ['#ffffff', '#000000', '#ff0000']
  }
}

describe('photo-gallery.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('filters photos by search, location and tags', () => {
    const store = usePhotoGalleryStore()
    const paris = createPhoto({ id: 'paris', stepName: 'Paris', location: 'Paris · France' })
    const lyon = createPhoto({ id: 'lyon', stepName: 'Lyon', location: 'Lyon · France', tags: ['step:lyon', 'pays:fr', 'orientation:portrait'] })
    store.photos = [paris, lyon]

    store.setFilters({ search: 'paris' })
    expect(store.filteredPhotos).toHaveLength(1)
    expect(store.filteredPhotos[0].id).toBe('paris')

    store.setFilters({ search: '', locations: ['Lyon · France'] })
    expect(store.filteredPhotos).toHaveLength(1)
    expect(store.filteredPhotos[0].id).toBe('lyon')

    store.setFilters({ locations: [], tags: ['orientation:portrait'] })
    expect(store.filteredPhotos).toHaveLength(1)
    expect(store.filteredPhotos[0].id).toBe('lyon')
  })

  it('supports selection toggling and setSelection', () => {
    const store = usePhotoGalleryStore()
    const photoA = createPhoto({ id: 'a' })
    const photoB = createPhoto({ id: 'b' })
    store.photos = [photoA, photoB]

    store.toggleSelection('a')
    expect(store.selection.has('a')).toBe(true)

    store.setSelection(['b'])
    expect(store.selection.has('a')).toBe(false)
    expect(store.selection.has('b')).toBe(true)

    store.clearSelection()
    expect(store.selection.size).toBe(0)
  })

  it('marks selection as favorite and handles deletion/restoration', () => {
    const store = usePhotoGalleryStore()
    const photoA = createPhoto({ id: 'a' })
    const photoB = createPhoto({ id: 'b' })
    store.photos = [photoA, photoB]

    store.setSelection(['a', 'b'])
    store.markSelectionAsFavorite()
    expect(store.photos.every(photo => photo.customFavorite)).toBe(true)

    store.deleteSelection()
    expect(store.photos.filter(photo => !photo.hidden)).toHaveLength(0)

    store.restoreLastRemoval()
    expect(store.photos.filter(photo => !photo.hidden)).toHaveLength(2)
  })

  it('applies adjustments with clamping and updates css preview map', () => {
    const store = usePhotoGalleryStore()
    const photo = createPhoto({ id: 'a' })
    store.photos = [photo]

    store.applyAdjustments('a', {
      filterPreset: 'vivid',
      adjustments: { brightness: 200, contrast: -150, saturation: 50, warmth: 30 },
      rotation: 90,
      crop: { ratio: '1:1', zoom: 2, offsetX: 10, offsetY: -5 }
    })

    const updated = store.photos[0]
    expect(updated.filterPreset).toBe('vivid')
    expect(updated.adjustments.brightness).toBe(100)
    expect(updated.adjustments.contrast).toBe(-100)
    expect(updated.adjustments.saturation).toBe(50)
    expect(updated.rotation).toBe(90)
    expect(updated.crop.ratio).toBe('1:1')

    const css = store.cssPreview.get('a')
    expect(css).toBe(buildCssFilter(updated.adjustments, updated.filterPreset))
  })
})
