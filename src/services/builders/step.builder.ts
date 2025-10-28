import { Trip, Step } from '../../models/types'
import { getPositionPercentage } from '../map.service'
import { getElevation } from '../elevation.service'

/**
 * Escape HTML special characters
 */
function esc(s: any): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Format a number in French locale without decimals
 */
function numberFr0(n: number): string {
  return new Intl.NumberFormat('fr-FR', { 
    maximumFractionDigits: 0, 
    minimumFractionDigits: 0, 
    useGrouping: true 
  }).format(n)
}

/**
 * Convert coordinates to DMS format
 */
function toDMS(lat: number, lon: number): string {
  const fmt = (deg: number, isLat: boolean) => {
    const d = Math.floor(Math.abs(deg))
    const mFloat = (Math.abs(deg) - d) * 60
    const m = Math.floor(mFloat)
    const s = (mFloat - m) * 60
    const hemi = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W')
    return `${d}°${String(m).padStart(2,'0')}'${s.toFixed(2)}"${hemi}`
  }
  return `${fmt(lat, true)}, ${fmt(lon, false)}`
}

/**
 * Get month name in French
 */
function monthName(d: Date): string {
  return d.toLocaleString('fr-FR', { month: 'long' })
}

/**
 * CSS URL value (data: without quotes, otherwise single quotes)
 */
function cssUrlValue(urlStr: string): string {
  const cssUrlSingleQuoted = (path: string): string => {
    return String(path).replace(/\\/g, "\\\\").replace(/'/g, "\\'")
  }
  return urlStr.startsWith('data:') ? urlStr : `'${cssUrlSingleQuoted(urlStr)}'`
}

/**
 * Simple country-name mapping to French (uppercased)
 */
const COUNTRY_FR: Record<string, string> = {
  fr: 'FRANCE', de: 'ALLEMAGNE', it: 'ITALIE', si: 'SLOVENIE', at: 'AUTRICHE',
  be: 'BELGIQUE', nl: 'PAYS-BAS', es: 'ESPAGNE', pt: 'PORTUGAL', ch: 'SUISSE',
  gb: 'ROYAUME-UNI', uk: 'ROYAUME-UNI', cz: 'REPUBLIQUE TCHEQUE', sk: 'SLOVAQUIE',
  hu: 'HONGRIE', hr: 'CROATIE', ba: 'BOSNIE-HERZEGOVINE', rs: 'SERBIE', me: 'MONTENEGRO',
  mk: 'MACEDOINE DU NORD', gr: 'GRECE', pl: 'POLOGNE', ro: 'ROUMANIE', bg: 'BULGARIE',
  dk: 'DANEMARK', no: 'NORVEGE', se: 'SUEDE', fi: 'FINLANDE', ee: 'ESTONIE',
  lv: 'LETTONIE', lt: 'LITUANIE', ie: 'IRLANDE', is: 'ISLANDE', lu: 'LUXEMBOURG',
  li: 'LIECHTENSTEIN', sm: 'SAINT-MARIN', va: 'VATICAN'
}

/**
 * Weather translations (normalized keys)
 */
const WEATHER_FR: Record<string, string> = {
  clear: 'ENSOLEILLEE', sunny: 'ENSOLEILLEE', clear_day: 'ENSOLEILLEE', clear_night: 'NUIT CLAIRE',
  mostly_sunny: 'PLUTOT ENSOLEILLE', partly_cloudy: 'PARTIELLEMENT NUAGEUX', partly_cloudy_day: 'PARTIELLEMENT NUAGEUX',
  cloudy: 'NUAGEUX', overcast: 'COUVERT', rain: 'PLUVIEUX', light_rain: 'PLUIE LEGERE', heavy_rain: 'FORTES PLUIES',
  drizzle: 'BRUINE', snow: 'NEIGE', sleet: 'NEIGE FONDUE', hail: 'GRELE', fog: 'BROUILLARD', wind: 'VENTEUX',
  thunderstorm: 'ORAGE'
}

/**
 * Get French country name from code with fallback
 */
function countryNameFrFromCode(code: string, fallback?: string): string {
  try {
    const Ctor: any = (Intl as any).DisplayNames
    if (Ctor) {
      const dn = new Ctor(['fr'], { type: 'region' })
      const name = dn.of(code?.toUpperCase?.())
      if (name) return String(name).toUpperCase()
    }
  } catch {}
  return (fallback || code || '').toString().toUpperCase()
}

/**
 * Normalize key for weather lookup
 */
function normKey(s: any): string {
  return String(s || '').toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '')
}

/**
 * Convert country code to flag emoji
 */
function ccToEmoji(cc: string): string {
  cc = (cc || '').toUpperCase()
  if (cc.length !== 2) return ''
  const A = 127397
  const codePoints = [cc.charCodeAt(0) + A, cc.charCodeAt(1) + A]
  return String.fromCodePoint(...codePoints)
}

export type StepBuilderContext = {
  trip: Trip
  step: Step
  photosMapping: Record<number, Record<number, any>>
  photoDataUrlMap: Record<string, string>
  stepPlan?: {
    cover?: number
    pages: number[][]
  }
}

type PhotoWithMeta = {
  index: number
  path: string
  ratio: 'PORTRAIT' | 'LANDSCAPE' | 'UNKNOWN'
}

/**
 * Construit les pages HTML pour une étape du voyage
 * @param context - Contexte contenant l'étape, le trip, les photos et le plan éventuel
 * @returns HTML de l'étape (page de titre + pages de photos)
 */
export async function buildStepSection(context: StepBuilderContext): Promise<string> {
  const { trip, step, photosMapping, photoDataUrlMap, stepPlan } = context
  
  const mapping = photosMapping[step.id] || {}
  const photosArr = Object.values(mapping) as PhotoWithMeta[]
  const portrait = photosArr.filter(p => p.ratio === 'PORTRAIT')
  const landscape = photosArr.filter(p => p.ratio === 'LANDSCAPE')
  const other = photosArr.filter(p => p.ratio === 'UNKNOWN')

  const useCover = !step.description || step.description.length < 800
  let cover: PhotoWithMeta | null = null
  
  if (stepPlan?.cover != null) {
    cover = photosArr.find(p => p.index === stepPlan.cover) || null
  } else if (useCover) {
    cover = portrait[0] ?? landscape[0] ?? null
  }

  // Pages: si plan utilisateur présent, le suivre strictement; sinon, heuristique par défaut
  let pages: PhotoWithMeta[][] = []
  if (stepPlan) {
    const coverIdx = cover?.index
    pages = stepPlan.pages.map(arr => arr
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

  // Helper to resolve photo URL (data URL or original path)
  const resolvedPhotoUrl = (p: PhotoWithMeta) => photoDataUrlMap[p.path] || p.path

  // Compute map dot position
  let dotStyle = ''
  if (step.country_code && step.country_code !== '00') {
    const pos = await getPositionPercentage(step.country_code, { lat: step.lat, lon: step.lon })
    if (pos) dotStyle = `style="top: ${pos.top}%; left: ${pos.left}%"`
  }

  // Calculate trip percentage and day number
  const tripStart = new Date(trip.start_date * 1000)
  const lastStepDate = new Date(Math.max(...trip.steps.map(s => s.start_time * 1000)))
  const tripEnd = trip.end_date ? new Date(trip.end_date * 1000) : lastStepDate
  const msPerDay = 24 * 60 * 60 * 1000
  const tripDurationDays = Math.max(1, Math.round((+tripEnd - +tripStart) / msPerDay))
  const dayNumber = Math.floor((step.start_time * 1000 - +tripStart) / msPerDay) + 1
  const tripPercentage = (dayNumber * 100) / tripDurationDays

  const stepDate = new Date(step.start_time * 1000)
  
  // Elevation (cached or fetch)
  const elev = (step as any)._elev ?? await getElevation(step.lat, step.lon)
  const elevText = elev != null ? `${numberFr0(elev)}` : ''
  
  // Country in French (fallback to provided name uppercased)
  const cc = (step.country_code || '').toLowerCase()
  const countryHeading = COUNTRY_FR[cc] || countryNameFrFromCode(cc, step.country || cc)
  
  // Weather French label
  const wKey = normKey(step.weather_condition)
  const weatherText = (WEATHER_FR[wKey] || String(step.weather_condition || '').toUpperCase())

  const flagEmoji = ccToEmoji(step.country_code || '')

  const stepInfo = `
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
        ${step.country_code !== '00' ? `
              <div class="step-country-name">
                ${esc(countryHeading)}
              </div>
            </div>
            ${(() => {
                  const city = (step as any).city || ''
                  const hasCity = String(city).trim().length > 0
          const coords = toDMS(step.lat, step.lon)
          return hasCity ? `<div class="step-country-extra"> ( ${esc(city)}, ${esc(coords)} )</div>` : `<div class="step-country-extra"> ( ${esc(coords)} )</div>`
                })()}
              ` : ''}
            <div class="step-title">${esc(step.name)}</div>
          </div>
          ${step.country_code !== '00' ? `
          <div class="step-map">
            <img src="assets/images/maps/${esc(step.country_code.toLowerCase())}.svg" alt="" />
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
            <div class="step-stat-data">${esc(Number(step.weather_temperature).toFixed(1))} °C</div>
            <div class="step-stat-description">${esc(weatherText)}</div>
          </div>
          <div class="step-stat">
            <div class="step-stat-data">${esc(elevText)}</div>
            <div class="step-stat-description">METRES D'ALTITUDE</div>
          </div>
        </div>
        <div class="step-description">${esc(step.description ?? '')}</div>
      </div>
    </div>`

  let html = ''

  // First page: step info with optional cover photo
  if (cover) {
    html += `
      <div class="break-after">
        <div class="step-with-photo">
          <div>${stepInfo}</div>
          <div>
            <div class="photo-container" style="background-image: url(${cssUrlValue(resolvedPhotoUrl(cover))})">
              <div class="photo-index">${cover.index}</div>
            </div>
          </div>
        </div>
      </div>`
  } else {
    html += `
      <div class="break-after">
        ${stepInfo}
      </div>`
  }

  // Photo pages
  for (const page of pages) {
    if (page.length <= 2) {
      // one_or_two
      const left = page[0]
      const right = page[1]
      html += `
        <div class="break-after">
          <div class="photo-columns">
            <div class="photo-column">
              <div class="photo-container" style="background-image: url(${cssUrlValue(resolvedPhotoUrl(left))})">
                <div class="photo-index">${left.index}</div>
              </div>
            </div>
            ${right ? `
            <div class="photo-column">
              <div class="photo-container" style="background-image: url(${cssUrlValue(resolvedPhotoUrl(right))})">
                <div class="photo-index">${right.index}</div>
              </div>
            </div>` : ''}
          </div>
        </div>`
    } else {
      // three_or_four: first two left column, next two right column
      const col1 = page.slice(0, 2)
      const col2 = page.slice(2, 4)
      html += `
        <div class="break-after">
          <div class="photo-columns">
            <div class="photo-column">
              ${col1.map(p => `
              <div class="photo-container" style="background-image: url(${cssUrlValue(resolvedPhotoUrl(p))})"> 
                <div class="photo-index">${p.index}</div>
              </div>`).join('')}
            </div>
            <div class="photo-column">
              ${col2.map(p => `
              <div class="photo-container" style="background-image: url(${cssUrlValue(resolvedPhotoUrl(p))})"> 
                <div class="photo-index">${p.index}</div>
              </div>`).join('')}
            </div>
          </div>
        </div>`
    }
  }

  return html
}
