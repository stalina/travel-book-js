import { Trip } from '../../models/types'
import { escapeForCssUrlSingleQuotes, esc } from './utils'
import { loggerService } from '../logger.service'

/**
 * Builder pour la page de couverture du travel book.
 * 
 * Génère une page HTML de couverture avec photo, année et titre du voyage.
 * 
 * @example
 * ```ts
 * const builder = new CoverBuilder(trip, photosMapping, photoDataUrlMap);
 * const html = builder.build();
 * ```
 */
export class CoverBuilder {
  /**
   * Crée une nouvelle instance du CoverBuilder.
   * 
   * @param trip - Le voyage contenant les informations de couverture
   * @param photosMapping - Mapping des photos par étape: Record<stepId, Record<photoId, photo>>
   * @param photoDataUrlMap - Mapping des URLs de photos vers leurs data URLs
   */
  constructor(
    private readonly trip: Trip,
    private readonly photosMapping: Record<number, Record<number, any>>,
    private readonly photoDataUrlMap: Record<string, string>
  ) {}

  /**
   * Génère le HTML de la page de couverture.
   * 
   * @returns HTML de la page de couverture, ou chaîne vide en cas d'erreur
   * @public
   */
  public build(): string {
    try {
      const year = this.extractYear()
      const coverUrl = this.selectCoverPhoto()
      return this.generateHtml(year, coverUrl)
    } catch (e) {
      loggerService.error('cover-builder', 'Erreur lors de la génération de la couverture', e)
      return ''
    }
  }

  /**
   * Extrait l'année de début du voyage.
   * 
   * @returns Année au format numérique (ex: 2023)
   * @private
   */
  private extractYear(): number {
    return new Date(this.trip.start_date * 1000).getFullYear()
  }

  /**
   * Sélectionne la photo de couverture selon la priorité suivante:
   * 1. trip.cover_photo.large_thumbnail_path
   * 2. trip.cover_photo.path
   * 3. trip.cover_photo_path
   * 4. trip.cover_photo_thumb_path
   * 5. Première photo rencontrée dans les étapes
   * 
   * @returns URL de la photo sélectionnée, ou null si aucune photo disponible
   * @private
   */
  private selectCoverPhoto(): string | null {
    let coverUrl: string | null = null
    
    const rawCover = (this.trip as any).cover_photo?.large_thumbnail_path 
      || (this.trip as any).cover_photo?.path
      || (this.trip as any).cover_photo_path 
      || (this.trip as any).cover_photo_thumb_path
    
    if (rawCover) {
      coverUrl = rawCover
    }
    
    if (!coverUrl) {
      for (const s of this.trip.steps) {
        const mapping = this.photosMapping[s.id]
          ? Object.values(this.photosMapping[s.id]) as any[]
          : []
        if (mapping.length) { 
          coverUrl = (mapping[0] as any).path
          break 
        }
      }
    }
    
    return coverUrl
  }

  /**
   * Génère le HTML final de la page de couverture.
   * 
   * @param year - Année du voyage
   * @param coverUrl - URL de la photo de couverture (ou null pour fond thème)
   * @returns HTML complet de la page de couverture
   * @private
   */
  private generateHtml(year: number, coverUrl: string | null): string {
    // Si la coverUrl référence une photo déjà ajoutée, tenter d'utiliser sa data URL (pour cohérence offline) 
    // sinon laisser l'URL distante (sera potentiellement ignorée en single-file si cross-origin)
    let cssBg = ''
    if (coverUrl) {
      const resolved = this.photoDataUrlMap[coverUrl] || coverUrl
      cssBg = `style="background-image: url(${
        resolved.startsWith('data:') 
          ? resolved 
          : `'${escapeForCssUrlSingleQuotes(resolved)}'`
      });"`
    } else {
      cssBg = 'style="background: var(--theme-color);"'
    }
    
    const title = esc(this.trip.name || 'Voyage')
    
    return `\n      <div class="break-after cover-page">\n        <div class="cover-background" ${cssBg}>\n          <div class="cover-overlay">\n            <div class="cover-year">${year}</div>\n            <div class="cover-title">${title}</div>\n          </div>\n        </div>\n      </div>`
  }
}

// ===== DEPRECATED WRAPPER FOR BACKWARD COMPATIBILITY =====

/**
 * Type de contexte pour le builder de couverture.
 * 
 * @deprecated Utilisez directement `new CoverBuilder(trip, photosMapping, photoDataUrlMap)`
 */
export type CoverBuilderContext = {
  trip: Trip
  photosMapping: Record<number, Record<number, any>>
  photoDataUrlMap: Record<string, string>
}

/**
 * Construit la page de couverture du travel book.
 * 
 * @param context - Contexte contenant le voyage, le mapping des photos et leurs data URLs
 * @returns HTML de la page de couverture
 * @deprecated Utilisez `new CoverBuilder(trip, photosMapping, photoDataUrlMap).build()` à la place
 */
export function buildCoverSection(context: CoverBuilderContext): string {
  const builder = new CoverBuilder(context.trip, context.photosMapping, context.photoDataUrlMap)
  return builder.build()
}
