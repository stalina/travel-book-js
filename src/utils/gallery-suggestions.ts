import type { GalleryPhoto, LayoutSuggestion, LayoutType } from '../models/gallery.types'

const LAYOUT_METADATA: Record<LayoutType, { title: string; description: string }> = {
  'grid-2x2': {
    title: 'Grille 2×2 équilibrée',
    description: 'Quatre photos au format harmonieux pour une page composée.'
  },
  'hero-plus-2': {
    title: 'Hero + secondaires',
    description: 'Une photo coup de cœur avec deux compléments narratifs.'
  },
  'three-columns': {
    title: 'Trois colonnes chrono',
    description: 'Idéal pour raconter une progression en trois temps.'
  },
  'full-page': {
    title: 'Pleine page immersive',
    description: 'Mettre en avant votre photo la plus forte.'
  }
}

const layoutOrder: LayoutType[] = ['grid-2x2', 'hero-plus-2', 'three-columns', 'full-page']

interface RankedPhoto {
  photo: GalleryPhoto
  score: number
}

function rankPhotos(photos: GalleryPhoto[]): RankedPhoto[] {
  return photos
    .filter(photo => !photo.hidden)
    .map(photo => {
      let score = photo.aiFavoriteScore * 0.6
      if (photo.customFavorite) {
        score += 0.25
      }
      if (photo.qualityInsights.length === 0) {
        score += 0.1
      } else {
        score -= photo.qualityInsights.length * 0.05
      }
      if (photo.orientation === 'landscape') {
        score += 0.05
      }
      return { photo, score }
    })
    .sort((a, b) => b.score - a.score)
}

function uniqueIds(list: GalleryPhoto[]): GalleryPhoto[] {
  const seen = new Set<string>()
  const output: GalleryPhoto[] = []
  for (const photo of list) {
    if (!seen.has(photo.id)) {
      output.push(photo)
      seen.add(photo.id)
    }
  }
  return output
}

export function generateLayoutSuggestions(
  photos: GalleryPhoto[],
  selectedIds: Set<string>
): LayoutSuggestion[] {
  if (!photos.length) {
    return []
  }

  const ranked = rankPhotos(photos)
  const selectedPhotos = selectedIds.size
    ? ranked.filter(entry => selectedIds.has(entry.photo.id))
    : ranked

  const basePool = selectedPhotos.length ? selectedPhotos.map(item => item.photo) : ranked.map(item => item.photo)

  const suggestions: LayoutSuggestion[] = []

  for (const layout of layoutOrder) {
    const config = LAYOUT_METADATA[layout]
    let photoIds: string[] = []

    switch (layout) {
      case 'grid-2x2': {
        const preferred = basePool.filter(photo => photo.orientation !== 'portrait')
        const four = uniqueIds([...preferred, ...basePool]).slice(0, 4)
        if (four.length >= 4) {
          photoIds = four.slice(0, 4).map(photo => photo.id)
        }
        break
      }
      case 'hero-plus-2': {
        const [hero, ...rest] = basePool
        if (hero) {
          const supporters = uniqueIds(rest).slice(0, 2)
          photoIds = [hero.id, ...supporters.map(item => item.id)]
        }
        break
      }
      case 'three-columns': {
        const portraits = basePool.filter(photo => photo.orientation !== 'landscape')
        const trio = uniqueIds([...portraits, ...basePool]).slice(0, 3)
        if (trio.length >= 3) {
          photoIds = trio.map(photo => photo.id)
        }
        break
      }
      case 'full-page': {
        const hero = basePool[0]
        if (hero) {
          photoIds = [hero.id]
        }
        break
      }
      default:
        break
    }

    if (photoIds.length) {
      suggestions.push({
        id: `${layout}-${photoIds.join('-')}`,
        type: layout,
        title: config.title,
        description: config.description,
        photoIds,
        rationale: selectedIds.size
          ? 'Basé sur votre sélection active.'
          : 'Suggestion IA à partir des meilleures photos du voyage.'
      })
    }
  }

  return suggestions
}
