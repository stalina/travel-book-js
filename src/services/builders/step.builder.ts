import { Trip, Step } from '../../models/types'
import { getPositionPercentage } from '../map.service'
import { elevationService } from '../elevation.service'
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
    private readonly stepPlan?: { cover?: number; pages: number[][] }
  ) {}

  /**
   * Génère le HTML complet de l'étape
   * @returns Promise<string> HTML de l'étape (page de titre + pages de photos)
   */
  public async build(): Promise<string> {
    const mapping = this.photosMapping[this.step.id] || {}
    const photosArr = Object.values(mapping) as PhotoWithMeta[]
    
    const { cover, pages } = this.planLayout(photosArr)
    const dotStyle = await this.calculateMapDotPosition()
    const stepInfo = await this.buildStepInfo(dotStyle)

    let html = ''

    // Page de couverture avec ou sans photo
    if (cover) {
      html += this.buildCoverPageWithPhoto(stepInfo, cover)
    } else {
      html += this.buildCoverPageWithoutPhoto(stepInfo)
    }

    // Pages de photos
    for (const page of pages) {
      html += this.buildPhotoPage(page)
    }

    return html
  }

  /**
   * Planifie la mise en page: sélectionne la photo de couverture et organise les pages
   */
  private planLayout(photosArr: PhotoWithMeta[]): {
    cover: PhotoWithMeta | null
    pages: PhotoWithMeta[][]
  } {
    const portrait = photosArr.filter(p => p.ratio === 'PORTRAIT')
    const landscape = photosArr.filter(p => p.ratio === 'LANDSCAPE')
    const other = photosArr.filter(p => p.ratio === 'UNKNOWN')

    const useCover = !this.step.description || this.step.description.length < 800
    let cover: PhotoWithMeta | null = null
    
    if (this.stepPlan?.cover != null) {
      cover = photosArr.find(p => p.index === this.stepPlan!.cover) || null
    } else if (useCover) {
      cover = portrait[0] ?? landscape[0] ?? null
    }

    // Pages: si plan utilisateur présent, le suivre; sinon, heuristique par défaut
    let pages: PhotoWithMeta[][] = []
    if (this.stepPlan) {
      const coverIdx = cover?.index
      pages = this.stepPlan.pages.map(arr => arr
        .map(idx => photosArr.find(p => p.index === idx))
        .filter((p): p is PhotoWithMeta => !!p && (coverIdx ? p.index !== coverIdx : true))
      )
    } else {
      const candLand = [...landscape]
      const candPort = cover ? portrait.filter(p => p !== cover) : [...portrait]
      const candOther = [...other]
      while (candLand.length >= 4) pages.push(candLand.splice(0, 4))
      while (candLand.length >= 2 && candPort.length >= 1)
        pages.push([candLand.shift()!, candLand.shift()!, candPort.shift()!])
      while (candPort.length >= 2) pages.push(candPort.splice(0, 2))
      while (candPort.length) pages.push([candPort.shift()!])
      while (candLand.length) pages.push([candLand.shift()!])
      while (candOther.length) pages.push([candOther.shift()!])
    }

    return { cover, pages }
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
   */
  private async buildStepInfo(dotStyle: string): Promise<string> {
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
        <div class="step-description">${esc(this.step.description ?? '')}</div>
      </div>
    </div>`
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
   * Construit une page de photos
   */
  private buildPhotoPage(page: PhotoWithMeta[]): string {
    if (page.length <= 2) {
      return this.buildOneOrTwoPhotosPage(page)
    } else {
      return this.buildThreeOrFourPhotosPage(page)
    }
  }

  /**
   * Construit une page avec 1 ou 2 photos
   */
  private buildOneOrTwoPhotosPage(page: PhotoWithMeta[]): string {
    const left = page[0]
    const right = page[1]
    return `
        <div class="break-after">
          <div class="photo-columns">
            <div class="photo-column">
              <div class="photo-container" style="background-image: url(${cssUrlValue(this.resolvedPhotoUrl(left))})">
                <div class="photo-index">${left.index}</div>
              </div>
            </div>
            ${right ? `
            <div class="photo-column">
              <div class="photo-container" style="background-image: url(${cssUrlValue(this.resolvedPhotoUrl(right))})">
                <div class="photo-index">${right.index}</div>
              </div>
            </div>` : ''}
          </div>
        </div>`
  }

  /**
   * Construit une page avec 3 ou 4 photos (2 colonnes)
   */
  private buildThreeOrFourPhotosPage(page: PhotoWithMeta[]): string {
    const col1 = page.slice(0, 2)
    const col2 = page.slice(2, 4)
    return `
        <div class="break-after">
          <div class="photo-columns">
            <div class="photo-column">
              ${col1.map(p => `
              <div class="photo-container" style="background-image: url(${cssUrlValue(this.resolvedPhotoUrl(p))})"> 
                <div class="photo-index">${p.index}</div>
              </div>`).join('')}
            </div>
            <div class="photo-column">
              ${col2.map(p => `
              <div class="photo-container" style="background-image: url(${cssUrlValue(this.resolvedPhotoUrl(p))})"> 
                <div class="photo-index">${p.index}</div>
              </div>`).join('')}
            </div>
          </div>
        </div>`
  }
}
