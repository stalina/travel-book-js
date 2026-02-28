import { Trip, Step } from '../../models/types'
import type { CoverFormat, StepGenerationPlan, StepPageLayout, StepPagePlanItem } from '../../models/editor.types'
import { getPositionPercentage } from '../map.service'
import { elevationService } from '../elevation.service'
import { generateAutomaticPages, inferLayoutFromCount } from '../../utils/layout-generator'
import { 
  esc, 
  numberFr0, 
  toDMS, 
  monthName, 
  cssUrlValue, 
  COUNTRY_FR, 
  WEATHER_FR, 
  countryNameFrFromCode, 
  normKey 
} from './utils'

type PhotoWithMeta = {
  index: number
  path: string
  ratio: 'PORTRAIT' | 'LANDSCAPE' | 'UNKNOWN'
}

type ResolvedPage = {
  layout: StepPageLayout
  photos: PhotoWithMeta[]
}

/**
 * Builder pour générer les pages HTML d'une étape du voyage
 * Gère la couverture, les photos et la mise en page automatique
 */
export class StepBuilder {
  /**
   * Crée une instance de StepBuilder
   * @param trip - Le voyage complet (pour calculer le pourcentage de progression)
   * @param step - L'étape à générer
   * @param photosMapping - Mapping des photos par étape
   * @param photoDataUrlMap - Map des chemins vers data URLs
   * @param stepPlan - Plan optionnel définissant la mise en page
   */
  constructor(
    private readonly trip: Trip,
    private readonly step: Step,
    private readonly photosMapping: Record<number, Record<number, any>>,
    private readonly photoDataUrlMap: Record<string, string>,
    private readonly stepPlan?: StepGenerationPlan
  ) {}

  /**
   * Génère le HTML complet de l'étape
   * @returns Promise<string> HTML de l'étape (page de titre + pages de photos)
   */
  public async build(): Promise<string> {
    const mapping = this.photosMapping[this.step.id] || {}
    const photosArr = Object.values(mapping) as PhotoWithMeta[]

    const coverFormat: CoverFormat = this.stepPlan?.coverFormat ?? 'text-image'
    const { cover, cover2, pages } = this.planLayout(photosArr, coverFormat)
    const dotStyle = await this.calculateMapDotPosition()

    let html = ''

    // Page de couverture selon l'agencement choisi
    switch (coverFormat) {
      case 'text-only':
        html += this.buildCoverPageWithoutPhoto(await this.buildStepInfo(dotStyle))
        break
      case 'image-full':
        if (cover) {
          html += this.buildCoverPageImageFull(await this.buildStepInfoWithoutDescription(dotStyle), cover)
        } else {
          html += this.buildCoverPageWithoutPhoto(await this.buildStepInfo(dotStyle))
        }
        break
      case 'image-two':
        if (cover) {
          html += this.buildCoverPageImageTwo(await this.buildStepInfoWithoutDescription(dotStyle), cover, cover2)
        } else {
          html += this.buildCoverPageWithoutPhoto(await this.buildStepInfo(dotStyle))
        }
        break
      case 'text-image':
      default:
        if (cover) {
          html += this.buildCoverPageWithPhoto(await this.buildStepInfo(dotStyle), cover)
        } else {
          html += this.buildCoverPageWithoutPhoto(await this.buildStepInfo(dotStyle))
        }
        break
    }

    // Pages de photos
    for (const page of pages) {
      html += this.buildPhotoPage(page)
    }

    return html
  }

  /**
   * Planifie la mise en page: sélectionne la/les photo(s) de couverture et organise les pages
   */
  private planLayout(photosArr: PhotoWithMeta[], coverFormat: CoverFormat): {
    cover: PhotoWithMeta | null
    cover2: PhotoWithMeta | null
    pages: ResolvedPage[]
  } {
    const photoByIndex = new Map<number, PhotoWithMeta>()
    for (const photo of photosArr) {
      photoByIndex.set(photo.index, photo)
    }

    // Pour 'text-only', aucune photo sur la page de couverture
    if (coverFormat === 'text-only') {
      if (this.stepPlan) {
        const plannedPages = this.resolvePlannedPages(photoByIndex, null, null)
        if (plannedPages.length) return { cover: null, cover2: null, pages: plannedPages }
      }
      return { cover: null, cover2: null, pages: this.buildAutomaticPages(photosArr, null) }
    }

    const defaultCover = this.selectDefaultCover(photosArr)
    const cover = this.resolveCover(photoByIndex, defaultCover)

    // Pour 'image-two', résoudre une 2e photo de couverture
    let cover2: PhotoWithMeta | null = null
    if (coverFormat === 'image-two') {
      cover2 = this.resolveCover2(photoByIndex, photosArr, cover)
    }

    if (this.stepPlan) {
      const plannedPages = this.resolvePlannedPages(photoByIndex, cover, cover2)
      if (plannedPages.length) {
        return { cover, cover2, pages: plannedPages }
      }
    }

    return { cover, cover2, pages: this.buildAutomaticPages(photosArr, cover, cover2) }
  }

  private selectDefaultCover(photosArr: PhotoWithMeta[]): PhotoWithMeta | null {
    if (!this.step.description || this.step.description.length < 800) {
      const portrait = photosArr.find((photo) => photo.ratio === 'PORTRAIT')
      if (portrait) return portrait
      const landscape = photosArr.find((photo) => photo.ratio === 'LANDSCAPE')
      if (landscape) return landscape
    }
    return null
  }

  private resolveCover(
    photoByIndex: Map<number, PhotoWithMeta>,
    fallback: PhotoWithMeta | null
  ): PhotoWithMeta | null {
    if (this.stepPlan?.cover != null) {
      const planned = photoByIndex.get(this.stepPlan.cover)
      if (planned) {
        return planned
      }
    }
    return fallback
  }

  private normalizePlanEntry(entry: StepPagePlanItem | number[]): StepPagePlanItem {
    if (Array.isArray(entry)) {
      return {
        layout: inferLayoutFromCount(entry.length),
        photoIndices: [...entry]
      }
    }
    return {
      layout: entry.layout,
      photoIndices: [...entry.photoIndices]
    }
  }

  private resolveCover2(
    photoByIndex: Map<number, PhotoWithMeta>,
    photosArr: PhotoWithMeta[],
    cover: PhotoWithMeta | null
  ): PhotoWithMeta | null {
    // Utiliser cover2 du plan si disponible
    if (this.stepPlan?.cover2 != null) {
      const planned = photoByIndex.get(this.stepPlan.cover2)
      if (planned) return planned
    }
    // Auto-sélection : première photo différente de la couverture principale
    const coverIndex = cover?.index ?? null
    const candidate = photosArr.find(
      (p) => p.index !== coverIndex && (p.ratio === 'PORTRAIT' || p.ratio === 'LANDSCAPE')
    )
    return candidate ?? null
  }

  private resolvePlannedPages(
    photoByIndex: Map<number, PhotoWithMeta>,
    cover: PhotoWithMeta | null,
    cover2: PhotoWithMeta | null = null
  ): ResolvedPage[] {
    if (!this.stepPlan) return []
    const coverIndices = new Set<number>()
    if (cover != null) coverIndices.add(cover.index)
    if (cover2 != null) coverIndices.add(cover2.index)
    const pages: ResolvedPage[] = []

    for (const rawEntry of this.stepPlan.pages ?? []) {
      const entry = this.normalizePlanEntry(rawEntry)
      const photos = entry.photoIndices
        .map((idx) => photoByIndex.get(idx) ?? null)
        .filter((photo): photo is PhotoWithMeta => !!photo && !coverIndices.has(photo.index))

      // ✅ Ne pas ajouter les pages vides : si l'utilisateur supprime toutes les photos d'une page,
      // on ne veut pas générer une page vide avec un message "Ajoutez des photos"
      // Si l'utilisateur veut vraiment une page vide, il doit laisser au moins une photo
      if (photos.length > 0) {
        pages.push({
          layout: entry.layout,
          photos
        })
      }
    }

    return pages
  }

  private buildAutomaticPages(photosArr: PhotoWithMeta[], cover: PhotoWithMeta | null, cover2: PhotoWithMeta | null = null): ResolvedPage[] {
    const coverIndices = new Set<number>()
    if (cover != null) coverIndices.add(cover.index)
    if (cover2 != null) coverIndices.add(cover2.index)
    const firstExcluded = cover?.index ?? null
    
    // Utiliser l'utilitaire partagé pour générer les pages
    const generatedPages = generateAutomaticPages(photosArr, firstExcluded)
    
    // Convertir en ResolvedPage avec les photos complètes (exclure cover ET cover2)
    const photoByIndex = new Map<number, PhotoWithMeta>()
    for (const photo of photosArr) {
      photoByIndex.set(photo.index, photo)
    }
    
    return generatedPages
      .map((page) => ({
        layout: page.layout,
        photos: page.photoIndices
          .map((idx) => photoByIndex.get(idx))
          .filter((photo): photo is PhotoWithMeta => !!photo && !coverIndices.has(photo.index))
      }))
      .filter((page) => page.photos.length > 0)
  }

  /**
   * Calcule la position du point sur la carte du pays
   */
  private async calculateMapDotPosition(): Promise<string> {
    let dotStyle = ''
    if (this.step.country_code && this.step.country_code !== '00') {
      const pos = await getPositionPercentage(this.step.country_code, { 
        lat: this.step.lat, 
        lon: this.step.lon 
      })
      if (pos) dotStyle = `style="top: ${pos.top}%; left: ${pos.left}%"`
    }
    return dotStyle
  }

  /**
   * Construit la section d'information de l'étape
   * @param includeDescription - Si false, la div step-description n'est pas incluse
   */
  private async buildStepInfo(dotStyle: string, includeDescription = true): Promise<string> {
    const tripPercentage = this.calculateTripPercentage()
    const dayNumber = this.calculateDayNumber()
    const stepDate = new Date(this.step.start_time * 1000)
    
    // Elevation (cached or fetch)
    const elev = (this.step as any)._elev ?? await elevationService.getElevation(
      this.step.lat, 
      this.step.lon
    )
    const elevText = elev != null ? `${numberFr0(elev)}` : ''
    
    // Country in French
    const cc = (this.step.country_code || '').toLowerCase()
    const countryHeading = COUNTRY_FR[cc] || countryNameFrFromCode(cc, this.step.country || cc)
    
    // Weather French label
    const wKey = normKey(this.step.weather_condition)
    const weatherText = (WEATHER_FR[wKey] || String(this.step.weather_condition || '').toUpperCase())

    const flagEmoji = this.ccToEmoji(this.step.country_code || '')

    return `
    <div class="text-content">
      <div class="step-cover">
        <div class="step-days">
          <div class="step-days-popup" style="left: ${tripPercentage}%;">
            Jour ${dayNumber}
            <div class="step-days-popup-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="15" viewBox="0 0 40 15" fill="none">
                <path d="M17.5012 0.999025C18.9621 -0.169674 21.0379 -0.169676 22.4988 0.999024L40 15H0L17.5012 0.999025Z"></path>
              </svg>
            </div>
          </div>
          <div class="step-days-bar">
            <div class="step-days-bar-fill" style="width: ${tripPercentage}%;"></div>
          </div>
        </div>
        <div class="step-header">
          <div>
            <div class="step-country">
              <div class="step-country-flag">
                <span class="flag-emoji">${esc(flagEmoji)}</span>
              </div>
        ${this.step.country_code !== '00' ? `
              <div class="step-country-name">
                ${esc(countryHeading)}
              </div>
            </div>
            ${(() => {
                  const city = (this.step as any).city || ''
                  const hasCity = String(city).trim().length > 0
          const coords = toDMS(this.step.lat, this.step.lon)
          return hasCity ? `<div class="step-country-extra"> ( ${esc(city)}, ${esc(coords)} )</div>` : `<div class="step-country-extra"> ( ${esc(coords)} )</div>`
                })()}
              ` : ''}
            <div class="step-title">${esc(this.step.name)}</div>
          </div>
          ${this.step.country_code !== '00' ? `
          <div class="step-map">
            <img src="assets/images/maps/${esc(this.step.country_code.toLowerCase())}.svg" alt="" />
            <div class="step-map-dot" ${dotStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle opacity="0.3" cx="40" cy="40" r="40" fill="#47AEA2"></circle>
                <circle opacity="0.5" cx="40" cy="40" r="30" fill="#47AEA2"></circle>
                <circle opacity="0.7" cx="40" cy="40" r="18" fill="#47AEA2"></circle>
              </svg>
            </div>
          </div>` : ''}
        </div>
        <div class="step-stats">
          <div class="step-stat">
            <div class="step-stat-data">${String(stepDate.getDate()).padStart(2, '0')}</div>
            <div class="step-stat-description">${esc(monthName(stepDate))}</div>
          </div>
          <div class="step-stat">
            <div class="step-stat-data">${esc(Number(this.step.weather_temperature).toFixed(1))} °C</div>
            <div class="step-stat-description">${esc(weatherText)}</div>
          </div>
          <div class="step-stat">
            <div class="step-stat-data">${esc(elevText)}</div>
            <div class="step-stat-description">METRES D'ALTITUDE</div>
          </div>
        </div>
        ${includeDescription ? `<div class="step-description">${esc(this.step.description ?? '')}</div>` : ''}
      </div>
    </div>`
  }

  /**
   * Construit la section d'information sans la description textuelle
   * Utilisé pour les agencements image-full et image-two
   */
  private buildStepInfoWithoutDescription(dotStyle: string): Promise<string> {
    return this.buildStepInfo(dotStyle, false)
  }

  /**
   * Calcule le pourcentage de progression dans le voyage
   */
  private calculateTripPercentage(): number {
    const tripStart = new Date(this.trip.start_date * 1000)
    const lastStepDate = new Date(Math.max(...this.trip.steps.map(s => s.start_time * 1000)))
    const tripEnd = this.trip.end_date ? new Date(this.trip.end_date * 1000) : lastStepDate
    const msPerDay = 24 * 60 * 60 * 1000
    const tripDurationDays = Math.max(1, Math.round((+tripEnd - +tripStart) / msPerDay))
    const dayNumber = this.calculateDayNumber()
    return (dayNumber * 100) / tripDurationDays
  }

  /**
   * Calcule le numéro du jour dans le voyage
   */
  private calculateDayNumber(): number {
    const tripStart = new Date(this.trip.start_date * 1000)
    const msPerDay = 24 * 60 * 60 * 1000
    return Math.floor((this.step.start_time * 1000 - +tripStart) / msPerDay) + 1
  }

  /**
   * Convertit un code pays en emoji drapeau
   */
  private ccToEmoji(cc: string): string {
    cc = (cc || '').toUpperCase()
    if (cc.length !== 2) return ''
    const A = 127397
    const codePoints = [cc.charCodeAt(0) + A, cc.charCodeAt(1) + A]
    return String.fromCodePoint(...codePoints)
  }

  /**
   * Résout l'URL d'une photo (data URL ou chemin original)
   */
  private resolvedPhotoUrl(p: PhotoWithMeta): string {
    return this.photoDataUrlMap[p.path] || p.path
  }

  /**
   * Construit la page de couverture avec photo
   */
  private buildCoverPageWithPhoto(stepInfo: string, cover: PhotoWithMeta): string {
    return `
      <div class="break-after">
        <div class="step-with-photo">
          <div>${stepInfo}</div>
          <div>
            <div class="photo-container" style="background-image: url(${cssUrlValue(this.resolvedPhotoUrl(cover))})">
              <div class="photo-index">${cover.index}</div>
            </div>
          </div>
        </div>
      </div>`
  }

  /**
   * Construit la page de couverture sans photo
   */
  private buildCoverPageWithoutPhoto(stepInfo: string): string {
    return `
      <div class="break-after">
        ${stepInfo}
      </div>`
  }

  /**
   * Construit la page de couverture agencement image-full :
   * infos étape en haut (sans description), 1 grande image en bas
   */
  private buildCoverPageImageFull(stepInfo: string, cover: PhotoWithMeta): string {
    return `
      <div class="break-after">
        <div class="step-cover-image-full">
          <div class="step-cover-image-full__info">${stepInfo}</div>
          <div class="step-cover-image-full__photo" style="background-image: url(${cssUrlValue(this.resolvedPhotoUrl(cover))})">  
            <div class="photo-index">${cover.index}</div>
          </div>
        </div>
      </div>`
  }

  /**
   * Construit la page de couverture agencement image-two :
   * infos étape en haut (sans description), 2 images côte à côte en bas
   */
  private buildCoverPageImageTwo(stepInfo: string, cover: PhotoWithMeta, cover2: PhotoWithMeta | null): string {
    return `
      <div class="break-after">
        <div class="step-cover-image-two">
          <div class="step-cover-image-two__info">${stepInfo}</div>
          <div class="step-cover-image-two__photos">
            <div class="step-cover-image-two__photo" style="background-image: url(${cssUrlValue(this.resolvedPhotoUrl(cover))})">  
              <div class="photo-index">${cover.index}</div>
            </div>
            ${cover2 ? `
            <div class="step-cover-image-two__photo" style="background-image: url(${cssUrlValue(this.resolvedPhotoUrl(cover2))})">  
              <div class="photo-index">${cover2.index}</div>
            </div>` : ''}
          </div>
        </div>
      </div>`
  }

  /**
   * Construit une page de photos
   */
  private buildPhotoPage(page: ResolvedPage): string {
    if (!page.photos.length) {
      return this.buildEmptyLayout(page.layout)
    }

    switch (page.layout) {
      case 'grid-2x2':
        return this.buildGrid2x2Layout(page.photos)
      case 'hero-plus-2':
        return this.buildHeroPlusTwoLayout(page.photos)
      case 'three-columns':
        return this.buildThreeColumnsLayout(page.photos)
      case 'full-page':
      default:
        return this.buildFullPageLayout(page.photos)
    }
  }

  private buildGrid2x2Layout(photos: PhotoWithMeta[]): string {
    return `
      <div class="break-after">
        <div class="step-layout layout-grid-2x2">
          ${photos.map((photo) => this.renderPhotoCell(photo)).join('')}
        </div>
      </div>`
  }

  private buildHeroPlusTwoLayout(photos: PhotoWithMeta[]): string {
    const [hero, ...supports] = photos
    return `
      <div class="break-after">
        <div class="step-layout layout-hero-plus-2">
          ${hero ? this.renderPhotoCell(hero, 'hero') : ''}
          ${supports.map((photo) => this.renderPhotoCell(photo, 'support')).join('')}
        </div>
      </div>`
  }

  private buildThreeColumnsLayout(photos: PhotoWithMeta[]): string {
    return `
      <div class="break-after">
        <div class="step-layout layout-three-columns">
          ${photos.map((photo) => this.renderPhotoCell(photo)).join('')}
        </div>
      </div>`
  }

  private buildFullPageLayout(photos: PhotoWithMeta[]): string {
    const photo = photos[0]
    if (!photo) {
      return this.buildEmptyLayout('full-page')
    }
    return `
      <div class="break-after">
        <div class="step-layout layout-full-page">
          ${this.renderPhotoCell(photo, 'full')}
        </div>
      </div>`
  }

  private buildEmptyLayout(layout: StepPageLayout): string {
    return `
      <div class="break-after">
        <div class="step-layout layout-empty ${layout}">
          <div class="layout-empty-message">Ajoutez des photos à cette page pour remplir la mise en page.</div>
        </div>
      </div>`
  }

  private renderPhotoCell(photo: PhotoWithMeta, extraClass = ''): string {
    return `
      <div class="layout-photo ${extraClass}">
        <div class="layout-photo-image" style="background-image: url(${cssUrlValue(this.resolvedPhotoUrl(photo))})">
          <span class="layout-photo-index">${photo.index}</span>
        </div>
      </div>`
  }
}
