import { Trip } from '../../models/types'
import { escapeForCssUrlSingleQuotes, esc } from './utils'
import { logger } from '../logger.service'

export type CoverBuilderContext = {
  trip: Trip
  photosMapping: Record<number, Record<number, any>>
  photoDataUrlMap: Record<string, string>
}

/**
 * Construit la page de couverture du travel book
 * @param context - Contexte contenant le voyage, le mapping des photos et leurs data URLs
 * @returns HTML de la page de couverture
 */
export function buildCoverSection(context: CoverBuilderContext): string {
  try {
    const { trip, photosMapping, photoDataUrlMap } = context
    const year = new Date(trip.start_date * 1000).getFullYear()
    
    // Sélection de la photo de couverture: priorité trip.cover_photo.large_thumbnail_path, sinon cover_photo_path, sinon première photo rencontrée dans stepPhotos
    let coverUrl: string | null = null
    const rawCover = (trip as any).cover_photo?.large_thumbnail_path 
      || (trip as any).cover_photo?.path
      || (trip as any).cover_photo_path 
      || (trip as any).cover_photo_thumb_path
    if (rawCover) coverUrl = rawCover
    
    if (!coverUrl) {
      for (const s of trip.steps) {
        const mapping = photosMapping[s.id]
          ? Object.values(photosMapping[s.id]) as any[]
          : []
        if (mapping.length) { 
          coverUrl = (mapping[0] as any).path
          break 
        }
      }
    }
    
    // Si la coverUrl référence une photo déjà ajoutée, tenter d'utiliser sa data URL (pour cohérence offline) sinon laisser l'URL distante (sera potentiellement ignorée en single-file si cross-origin)
    let cssBg = ''
    if (coverUrl) {
      const resolved = photoDataUrlMap[coverUrl] || coverUrl
      cssBg = `style="background-image: url(${
        resolved.startsWith('data:') 
          ? resolved 
          : `'${escapeForCssUrlSingleQuotes(resolved)}'`
      });"`
    } else {
      cssBg = 'style="background: var(--theme-color);"'
    }
    
    const title = esc(trip.name || 'Voyage')
    
    return `\n      <div class="break-after cover-page">\n        <div class="cover-background" ${cssBg}>\n          <div class="cover-overlay">\n            <div class="cover-year">${year}</div>\n            <div class="cover-title">${title}</div>\n          </div>\n        </div>\n      </div>`
  } catch (e) {
    logger.error('cover-builder', 'Erreur lors de la génération de la couverture', e)
    return ''
  }
}
