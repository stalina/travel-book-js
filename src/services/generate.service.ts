import { FFInput } from './fs.service'
import { Trip, Step } from '../models/types'
import { getPositionPercentage } from './map.service'
import { getElevation, getElevationsBulk } from './elevation.service'

export type GeneratedArtifacts = {
  manifest: Record<string, Blob>
}

export type GenerateOptions = {
  photosPlan?: string // contenu texte de photos_by_pages.txt permettant d'écraser la pagination auto
}


/**
 * Escapes a string for inclusion inside a single-quoted CSS url('...') value.
 * Escapes both backslash and single quote.
 * E.g., O'Reilly\foo  ->  O\\'Reilly\\\\foo
 */
function escapeForCssUrlSingleQuotes(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// Logger minimaliste pour le debug (prefixé), centralise l'usage de console
const DBG = {
  log: (...args: any[]) => {
    // eslint-disable-next-line no-console
    console.log('[TB][generate]', ...args)
  },
  warn: (...args: any[]) => {
    // eslint-disable-next-line no-console
    console.warn('[TB][generate]', ...args)
  },
  time: (label: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(label + ':start')
    }
  },
  timeEnd: (label: string) => {
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      try {
        performance.mark(label + ':end')
        performance.measure(label, label + ':start', label + ':end')
        const entries = performance.getEntriesByName(label)
        const last = entries[entries.length - 1]
        // eslint-disable-next-line no-console
        console.log('[TB][generate][timing]', label, `${Math.round(last.duration)}ms`)
      } catch {}
    }
  }
}

function normalizePath(...parts: string[]) {
  return parts.join('/').replace(/\\/g, '/')
}

function guessRatio(w: number, h: number): 'PORTRAIT' | 'LANDSCAPE' | 'UNKNOWN' {
  const ratio = w / h
  if (Math.abs(ratio - 9/16) < 0.1 || Math.abs(ratio - 3/4) < 0.1) return 'PORTRAIT'
  if (Math.abs(ratio - 16/9) < 0.1 || Math.abs(ratio - 4/3) < 0.1) return 'LANDSCAPE'
  return 'UNKNOWN'
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

export async function generateArtifacts(input: FFInput, options?: GenerateOptions): Promise<GeneratedArtifacts> {
  const { trip, stepPhotos } = (window as any).__parsedTrip as { trip: Trip, stepPhotos: Record<number, File[]> }
  if (!trip) throw new Error('Trip non parsé')
  DBG.log('generateArtifacts:start', { tripId: (trip as any).id, steps: trip.steps.length })

  // Compute photos mapping and default pages similar to Python (simplified):
  const photosMapping: Record<number, Record<number, any>> = {}
  const photosByPagesLines: string[] = []
  // Data URLs des photos pour les inliner directement dans l'HTML (robuste côté iframe srcdoc)
  const photoDataUrlMap: Record<string, string> = {}

  // Build assets/style.css & fonts from project assets
  const cssResp = await fetch('/assets/style.css')
  const cssText = await cssResp.text()
  const fontsCssResp = await fetch('/assets/fonts/fonts.css')
  const fontsCssText = await fontsCssResp.text()
  DBG.log('assets:css loaded', { styleLen: cssText.length, fontsLen: fontsCssText.length })

  const manifest: Record<string, Blob> = {
    'assets/style.css': new Blob([cssText], { type: 'text/css' }),
    'assets/fonts/fonts.css': new Blob([fontsCssText], { type: 'text/css' })
  }

  // Also include the OTF font referenced by fonts.css (vérifie qu'on ne récupère pas une page HTML)
  try {
    const fontResp = await fetch('/assets/fonts/Brandon_Grotesque_medium.otf')
    if (fontResp.ok) {
      const ct = fontResp.headers.get('content-type') || ''
      if (!/text\/html/i.test(ct)) {
        const fontBlob = await fontResp.blob()
        manifest['assets/fonts/Brandon_Grotesque_medium.otf'] = fontBlob
        DBG.log('assets:font Brandon_Grotesque_medium.otf included', { size: fontBlob.size })
      }
    } else {
      DBG.warn('assets:font Brandon_Grotesque_medium.otf not found (ok=false)')
    }
  } catch {}

  // Optionally include local Noto Serif webfonts if present
  for (const f of ['NotoSerif-Regular.woff2', 'NotoSerif-Italic.woff2', 'NotoSerif-Bold.woff2', 'NotoSerif-BoldItalic.woff2']) {
    try {
      const resp = await fetch(`/assets/fonts/${f}`)
      if (resp.ok) {
        const ct = resp.headers.get('content-type') || ''
        if (!/text\/html/i.test(ct)) {
          manifest[`assets/fonts/${f}`] = await resp.blob()
          DBG.log('assets:font included', f)
        }
      } else {
        DBG.log('assets:font missing', f)
      }
    } catch {}
  }

  // Images folder
  // Simple country-name mapping to French (uppercased)
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

  // Weather translations (normalized keys)
  const WEATHER_FR: Record<string, string> = {
    clear: 'ENSOLEILLEE', sunny: 'ENSOLEILLEE', clear_day: 'ENSOLEILLEE', clear_night: 'NUIT CLAIRE',
    mostly_sunny: 'PLUTOT ENSOLEILLE', partly_cloudy: 'PARTIELLEMENT NUAGEUX', partly_cloudy_day: 'PARTIELLEMENT NUAGEUX',
    cloudy: 'NUAGEUX', overcast: 'COUVERT', rain: 'PLUVIEUX', light_rain: 'PLUIE LEGERE', heavy_rain: 'FORTES PLUIES',
    drizzle: 'BRUINE', snow: 'NEIGE', sleet: 'NEIGE FONDUE', hail: 'GRELE', fog: 'BROUILLARD', wind: 'VENTEUX',
    thunderstorm: 'ORAGE'
  }

  function normKey(s: any): string {
    return String(s || '').toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '')
  }

  // Pre-fetch elevations in bulk to avoid many sequential calls (and 429)
  try {
    const bulkElev = await getElevationsBulk(trip.steps.map(s => ({ lat: s.lat, lon: s.lon })))
    let countOk = 0
    trip.steps.forEach((s, i) => {
      const e = bulkElev[i]
      if (e != null) {
        ;(s as any)._elev = e
        countOk++
      }
    })
    DBG.log('elevations:bulk fetched', { total: trip.steps.length, resolved: countOk })
  } catch {}

  for (const step of trip.steps) {
    DBG.log('step:start', { id: step.id, name: step.name })
    const photos = stepPhotos[step.id] || []
    DBG.log('step:photos selected', { count: photos.length, names: photos.map(p => p.name) })
    const mapping: Record<number, any> = {}
    let idx = 1
    for (const f of photos) {
      const url = normalizePath('assets/images/photos', f.name)
      manifest[url] = f
      try {
        // Produire aussi une data URL pour usage direct dans l'HTML (évite les soucis de réécriture)
        photoDataUrlMap[url] = await fileToDataUrl(f)
      } catch {}
      // Compute ratio from file metadata if possible
      let ratio: 'PORTRAIT' | 'LANDSCAPE' | 'UNKNOWN' = 'UNKNOWN'
      try {
        const bmp = await createImageBitmap(f)
        ratio = guessRatio(bmp.width, bmp.height)
      } catch {}
      mapping[idx] = { id: f.name, index: idx, path: url, ratio }
      idx++
    }
    photosMapping[step.id] = mapping

    // Default cover & pages like Python (approx):
    const portrait = Object.values(mapping).filter(p => p.ratio === 'PORTRAIT')
    const landscape = Object.values(mapping).filter(p => p.ratio === 'LANDSCAPE')
    const other = Object.values(mapping).filter(p => p.ratio === 'UNKNOWN')
    DBG.log('step:ratios', { portrait: portrait.length, landscape: landscape.length, unknown: other.length })

    // Header
    const start = new Date(step.start_time * 1000)
    const header = `${String(start.getDate()).padStart(2, '0')}/${String(start.getMonth()+1).padStart(2,'0')}/${start.getFullYear()} ${step.name} (${step.id})`
    photosByPagesLines.push(header)

    // Cover if description short
    const useCover = !step.description || step.description.length < 800
    DBG.log('step:cover policy', { useCover })
    if (useCover && (portrait[0] || landscape[0])) {
      const cover = portrait[0] ?? landscape[0]
      DBG.log('step:cover chosen', { index: cover.index, ratio: cover.ratio })
      photosByPagesLines.push(`Cover photo: ${cover.index}`)
      // Remove cover from candidates
      const pIdx = portrait.indexOf(cover as any)
      if (pIdx >= 0) portrait.splice(pIdx,1)
      const lIdx = landscape.indexOf(cover as any)
      if (lIdx >= 0) landscape.splice(lIdx,1)
    }

    // Priority 1: groups of 4 landscape
    while (landscape.length >= 4) {
      const g = landscape.splice(0,4)
      photosByPagesLines.push(g.map(p=>p.index).join(' '))
    }
    // Priority 2: 2 landscape + 1 portrait
    while (landscape.length >= 2 && portrait.length >= 1) {
      const g = [...landscape.splice(0,2), portrait.shift()!]
      photosByPagesLines.push(g.map(p=>p.index).join(' '))
    }
    // Priority 3: 2 portrait
    while (portrait.length >= 2) {
      const g = portrait.splice(0,2)
      photosByPagesLines.push(g.map(p=>p.index).join(' '))
    }
    // Priority 4: singles
    for (const rest of [...portrait, ...landscape, ...other]) {
      photosByPagesLines.push(String(rest.index))
    }

    photosByPagesLines.push('')
    DBG.log('step:pages-by-lines appended')
  }

  // Si un plan utilisateur est fourni, on l'utilise pour remplacer photos_by_pages.txt
  const userPlanText = options?.photosPlan?.trim() ? String(options?.photosPlan) : ''
  if (userPlanText) {
    DBG.log('user-plan:override provided')
  }

  const mappingBlob = new Blob([JSON.stringify(photosMapping, null, 4)], { type: 'application/json' })
  const pagesBlob = new Blob([userPlanText || photosByPagesLines.join('\n')], { type: 'text/plain' })
  manifest['photos_mapping.json'] = mappingBlob
  manifest['photos_by_pages.txt'] = pagesBlob
  DBG.log('manifest:initialized', { entries: Object.keys(manifest).length })

  // Build HTML that mirrors Python templates
  function esc(s: any) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  // Construire un <head> sans dépendances externes (100% offline)
  let headHtml = `
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PolarSteps Travel book</title>
    <link rel="stylesheet" href="assets/style.css" />
    <link rel="stylesheet" href="assets/fonts/fonts.css" />
  </head>`
  try {
    // Si un template custom existe, on nettoie les liens externes (flag-icons, Google Fonts)
    const headTpl = await fetch('/templates/index.html').then(r => r.text())
    const match = headTpl.match(/<head>[\s\S]*?<\/head>/i)
    if (match) {
      let h = match[0]
      h = h
        .replace(/<link[^>]+flag-icons[^>]*>/ig, '')
        .replace(/<link[^>]+fonts\.googleapis[^>]*>/ig, '')
        .replace(/<link[^>]+fonts\.gstatic[^>]*>/ig, '')
        .replace(/<link[^>]+rel=["']preconnect["'][^>]*>/ig, '')
      // S'assurer que nos deux feuilles locales existent
      if (!/assets\/style\.css/.test(h)) h = h.replace(/<\/head>/i, '<link rel="stylesheet" href="assets/style.css" />\n</head>')
      if (!/assets\/fonts\/fonts\.css/.test(h)) h = h.replace(/<\/head>/i, '<link rel="stylesheet" href="assets/fonts/fonts.css" />\n</head>')
      headHtml = h
  DBG.log('html:custom head template applied')
    }
  } catch {}

  // Trip-level helpers
  const tripStart = new Date(trip.start_date * 1000)
  const lastStepDate = new Date(Math.max(...trip.steps.map(s => s.start_time * 1000)))
  const tripEnd = trip.end_date ? new Date(trip.end_date * 1000) : lastStepDate
  const msPerDay = 24 * 60 * 60 * 1000
  const tripDurationDays = Math.max(1, Math.round((+tripEnd - +tripStart) / msPerDay))

  function dayNumber(step: Step) {
    return Math.floor((step.start_time * 1000 - +tripStart) / msPerDay) + 1
  }
  function tripPercentage(step: Step) {
    return (dayNumber(step) * 100) / tripDurationDays
  }
  function monthName(d: Date) {
    return d.toLocaleString('fr-FR', { month: 'long' })
  }
  function numberFr0(n: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0, minimumFractionDigits: 0, useGrouping: true }).format(n)
  }
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
  function cssUrlSingleQuoted(path: string): string {
    // Conserver le chemin tel quel pour correspondre aux clés du manifest; échapper les apostrophes ET les backslashes
    return String(path).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  }
  function cssUrlValue(urlStr: string): string {
    // Pour data: on ne met pas de quotes; sinon, quotes simples
    return urlStr.startsWith('data:') ? urlStr : `'${cssUrlSingleQuoted(urlStr)}'`
  }
  function resolvedPhotoUrl(p: { path: string }) {
    return photoDataUrlMap[p.path] || p.path
  }
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

  // Collect required map SVGs (local only, no network)
  const usedCountries = Array.from(
    new Set(trip.steps.map(s => s.country_code).filter(c => c && c !== '00'))
  )
  const placeholderSvg = (code: string) => new Blob([
    `<?xml version="1.0" encoding="UTF-8"?>\n`+
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">`+
    `<rect width="100%" height="100%" fill="#e7ecf4"/>`+
    `<g fill="#4b5a6c">`+
    `<rect x="100" y="150" width="600" height="300" rx="24" ry="24" opacity="0.25"/>`+
    `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="56" fill="#4b5a6c">${code.toUpperCase()}</text>`+
    `</g>`+
    `</svg>`
  ], { type: 'image/svg+xml' })
  for (const code of usedCountries) {
    const localUrl = `/assets/images/maps/${code.toLowerCase()}.svg`
    try {
      const resp = await fetch(localUrl, { cache: 'no-store' })
      if (resp.ok) {
        const svg = await resp.blob()
        manifest[`assets/images/maps/${code.toLowerCase()}.svg`] = svg
        DBG.log('maps:included', { code, size: svg.size })
      } else {
        // eslint-disable-next-line no-console
        console.warn(`[maps] SVG local manquant: ${localUrl} — utilisation d'un placeholder`)
        manifest[`assets/images/maps/${code.toLowerCase()}.svg`] = placeholderSvg(code)
        DBG.log('maps:placeholder used', { code })
      }
    } catch {
      // eslint-disable-next-line no-console
      console.warn(`[maps] SVG local introuvable: ${localUrl} — utilisation d'un placeholder`)
      manifest[`assets/images/maps/${code.toLowerCase()}.svg`] = placeholderSvg(code)
      DBG.log('maps:placeholder used (exception)', { code })
    }
  }

  // Build body
  let bodyHtml = ''

  // --- Couverture ---------------------------------------------------------
  function buildCoverSection(): string {
    try {
      const year = new Date(trip.start_date * 1000).getFullYear()
      // Sélection de la photo de couverture: priorité trip.cover_photo.path, sinon cover_photo_path, sinon première photo rencontrée dans stepPhotos
      let coverUrl: string | null = null
      const rawCover = (trip as any).cover_photo?.path || (trip as any).cover_photo_path || (trip as any).cover_photo_thumb_path
      if (rawCover) coverUrl = rawCover
      if (!coverUrl) {
        for (const s of trip.steps) {
          const mapping = photosMapping[s.id]
            ? Object.values(photosMapping[s.id]) as any[]
            : []
          if (mapping.length) { coverUrl = (mapping[0] as any).path; break }
        }
      }
      // Si la coverUrl référence une photo déjà ajoutée, tenter d'utiliser sa data URL (pour cohérence offline) sinon laisser l'URL distante (sera potentiellement ignorée en single-file si cross-origin)
      let cssBg = ''
      if (coverUrl) {
        const resolved = photoDataUrlMap[coverUrl] || coverUrl
        cssBg = `style="background-image: url(${
          resolved.startsWith('data:') 
            ? resolved 
            : `'${resolved.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
        });"`
      } else {
        cssBg = 'style="background: var(--theme-color);"'
      }
      const title = esc(trip.name || 'Voyage')
      return `\n      <div class="break-after cover-page">\n        <div class="cover-background" ${cssBg}>\n          <div class="cover-overlay">\n            <div class="cover-year">${year}</div>\n            <div class="cover-title">${title}</div>\n          </div>\n        </div>\n      </div>`
    } catch (e) {
      DBG.warn('cover:build error', e)
      return ''
    }
  }
  bodyHtml += buildCoverSection()

  // --- Page Statistiques --------------------------------------------------
  function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371
    const toRad = (d: number) => d * Math.PI / 180
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
  function buildStatsSection(): string {
    try {
      if (!trip.steps.length) return ''
      // Pays uniques dans l'ordre de première apparition
      const seen = new Set<string>()
      const countries: { code: string, name: string }[] = []
      for (const s of trip.steps) {
        const code = (s.country_code || '').toLowerCase()
        if (code && code !== '00' && !seen.has(code)) {
          seen.add(code)
          countries.push({ code, name: COUNTRY_FR[code] || countryNameFrFromCode(code, code) })
        }
      }
      // Nombre de photos total (depuis photosMapping)
      let totalPhotos = 0
      for (const sid of Object.keys(photosMapping)) {
        totalPhotos += Object.keys(photosMapping[Number(sid)] || {}).length
      }
  const totalKm = (trip as any).total_km
  const km = totalKm ? Math.round(totalKm) : Math.round(trip.steps.reduce((acc, s, i, arr) => {
        if (i === 0) return 0
        const prev = arr[i-1]
        return acc + haversineKm(prev.lat, prev.lon, s.lat, s.lon)
      }, 0))
      const days = (() => {
        const start = new Date(trip.start_date * 1000)
        const end = trip.end_date ? new Date(trip.end_date * 1000) : new Date(Math.max(...trip.steps.map(s => s.start_time * 1000)))
        const diff = Math.round((+end - +start) / (24*3600*1000)) + 1
        return Math.max(1, diff)
      })()
      const stepsCount = trip.steps.length
      // Point le plus éloigné de la première étape
      const first = trip.steps[0]
      let maxDist = 0
      let farStep: Step | null = null
      for (const s of trip.steps) {
        const d = haversineKm(first.lat, first.lon, s.lat, s.lon)
        if (d > maxDist) { maxDist = d; farStep = s }
      }
      const maxDistKm = Math.round(maxDist)
      const farCity = (farStep as any)?.city || farStep?.name || ''

  // Construction HTML (nouveau layout 2 colonnes)
  // Distribution verticale gérée exclusivement par CSS Grid (une rangée 1fr par pays) côté CSS.
      const countriesHtml = countries.map(c => `
            <div class="stats-country">
              <div class="stats-country-shape">
                <img src="assets/images/maps/${esc(c.code)}.svg" alt="${esc(c.name)}" />
                <div class="stats-country-name">${esc(c.name)}</div>
              </div>
            </div>`).join('')

      const metricsGrid = `
              <div class="stats-metric"><div class="stats-icon">🗺️</div><div class="stats-value">${numberFr0(km)}</div><div class="stats-label">KILOMÈTRES</div></div>
              <div class="stats-metric"><div class="stats-icon">📆</div><div class="stats-value">${numberFr0(days)}</div><div class="stats-label">JOURS</div></div>
              <div class="stats-metric"><div class="stats-icon">📍</div><div class="stats-value">${numberFr0(stepsCount)}</div><div class="stats-label">ÉTAPES</div></div>
              <div class="stats-metric"><div class="stats-icon">📷</div><div class="stats-value">${numberFr0(totalPhotos)}</div><div class="stats-label">PHOTOS</div></div>`

      const tripSummary = esc((trip as any).summary || '')
      const departureCity = esc(((trip.steps[0] as any).city) || trip.steps[0].name || '')

  return `
      <div class="break-after stats-page">
        <div class="stats-layout">
          <div class="stats-left">
            <div class="stats-left-inner" style="--country-count:${countries.length};">${countriesHtml}</div>
          </div>
          <div class="stats-right">
            <div class="stats-header">
              <div class="stats-title">RÉSUMÉ DU VOYAGE</div>
              ${tripSummary ? `<div class="stats-subtitle">${tripSummary}</div>` : ''}
            </div>
            <div class="stats-metrics-grid">${metricsGrid}</div>
            <div class="stats-distance-block">
              <div class="stats-distance-diagram">
                <div class="stats-home-block">
                  <div class="stats-home">🏠</div>
                  <div class="stats-distance-text">Départ: ${departureCity}</div>
                </div>
                <div class="stats-arc">
                  <span>${numberFr0(maxDistKm)} km</span>
                  <svg class="stats-arc-svg" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M150 160 Q500 40 850 160" class="stats-arc-path" />
                  </svg>
                </div>
                <div class="stats-far-block">
                  <div class="stats-far">📍</div>
                  <div class="stats-distance-text">Point le plus éloigné${farCity ? ' : '+esc(farCity) : ''}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`
    } catch (e) {
      DBG.warn('stats:build error', e)
      return ''
    }
  }
  bodyHtml += buildStatsSection()

  // --- Page Carte ---------------------------------------------------------
  type BBox = { minLat: number, maxLat: number, minLon: number, maxLon: number }
  type SvgCoord = { x: number, y: number }

  function calculateBoundingBox(steps: Step[]): BBox | null {
    if (!steps.length) return null
    let minLat = Infinity, maxLat = -Infinity
    let minLon = Infinity, maxLon = -Infinity
    for (const s of steps) {
      if (s.lat < minLat) minLat = s.lat
      if (s.lat > maxLat) maxLat = s.lat
      if (s.lon < minLon) minLon = s.lon
      if (s.lon > maxLon) maxLon = s.lon
    }
    return { minLat, maxLat, minLon, maxLon }
  }

  function calculateViewBox(bbox: BBox, padding: number = 0.1): { x: number, y: number, width: number, height: number } {
    const latSpan = bbox.maxLat - bbox.minLat
    const lonSpan = bbox.maxLon - bbox.minLon
    const padLat = latSpan * padding
    const padLon = lonSpan * padding
    return {
      x: bbox.minLon - padLon,
      y: bbox.minLat - padLat,
      width: lonSpan + 2 * padLon,
      height: latSpan + 2 * padLat
    }
  }

  function latLonToSvg(lat: number, lon: number, viewBox: { x: number, y: number, width: number, height: number }): SvgCoord {
    // SVG Y axis goes down, lat goes up → invert Y
    const x = ((lon - viewBox.x) / viewBox.width) * 1000
    const y = ((viewBox.y + viewBox.height - lat) / viewBox.height) * 1000
    return { x, y }
  }

  function generatePathData(steps: Step[], viewBox: { x: number, y: number, width: number, height: number }): string {
    if (!steps.length) return ''
    const coords = steps.map(s => latLonToSvg(s.lat, s.lon, viewBox))
    if (coords.length === 1) {
      // Une seule étape : pas de ligne, juste un point (géré par les vignettes)
      return ''
    }
    // Première étape : Move
    let path = `M ${coords[0].x.toFixed(2)} ${coords[0].y.toFixed(2)}`
    // Étapes suivantes : Line
    for (let i = 1; i < coords.length; i++) {
      path += ` L ${coords[i].x.toFixed(2)} ${coords[i].y.toFixed(2)}`
    }
    return path
  }

  function generateStepMarkers(steps: Step[], viewBox: { x: number, y: number, width: number, height: number }): string {
    const markerSize = 40 // pixels
    const markers: string[] = []
    
    for (const step of steps) {
      const coord = latLonToSvg(step.lat, step.lon, viewBox)
      // Récupérer la photo principale de l'étape
      const stepMapping = photosMapping[step.id]
      const photos = stepMapping ? Object.values(stepMapping) as any[] : []
      const mainPhoto = photos.length > 0 ? photos[0] : null
      
      // Résoudre l'URL de la photo (data URL ou URL distante)
      let photoUrl = ''
      if (mainPhoto) {
        const rawUrl = mainPhoto.path
        photoUrl = photoDataUrlMap[rawUrl] || rawUrl
      }
      
      // Générer la vignette avec foreignObject pour utiliser HTML/CSS
      const bgStyle = photoUrl 
        ? `background-image: url(${photoUrl.startsWith('data:') ? photoUrl : `'${escapeForCssUrlSingleQuotes(photoUrl)}'`});`
        : 'background: var(--theme-color);'
      
      const iconFallback = photoUrl ? '' : '<div class="map-marker-icon">📍</div>'
      
      markers.push(`
        <foreignObject x="${(coord.x - markerSize/2).toFixed(2)}" y="${(coord.y - markerSize/2).toFixed(2)}" width="${markerSize}" height="${markerSize}">
          <div xmlns="http://www.w3.org/1999/xhtml" class="map-marker" style="${bgStyle} background-size: cover; background-position: center;">
            ${iconFallback}
          </div>
        </foreignObject>`)
    }
    
    return markers.join('\n')
  }

  function generateSatelliteBackground(bbox: BBox): string {
    // Calcul du niveau de zoom approprié pour couvrir le bounding box
    // Formule simplifiée basée sur la largeur en degrés
    const lonSpan = bbox.maxLon - bbox.minLon
    const latSpan = bbox.maxLat - bbox.minLat
    const maxSpan = Math.max(lonSpan, latSpan)
    
    // Niveau de zoom approximatif (plus c'est grand, plus le zoom est faible)
    let zoom = 1
    if (maxSpan < 0.1) zoom = 13
    else if (maxSpan < 0.5) zoom = 11
    else if (maxSpan < 1) zoom = 10
    else if (maxSpan < 2) zoom = 9
    else if (maxSpan < 5) zoom = 8
    else if (maxSpan < 10) zoom = 7
    else if (maxSpan < 20) zoom = 6
    else zoom = 5
    
    const centerLat = (bbox.minLat + bbox.maxLat) / 2
    const centerLon = (bbox.minLon + bbox.maxLon) / 2
    
    // Utiliser OpenStreetMap tiles (style satellite via Esri)
    // Note: Pour un vrai fond satellite, il faudrait une clé API Mapbox ou similaire
    // Ici on utilise les tiles Esri WorldImagery qui sont accessibles publiquement
    const tileUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}`
    
    // Convertir lat/lon en coordonnées de tuile
    const latRad = centerLat * Math.PI / 180
    const n = Math.pow(2, zoom)
    const xTile = Math.floor((centerLon + 180) / 360 * n)
    const yTile = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
    
    // Pour l'instant, on génère un fond stylisé avec indication que les tiles seraient chargées
    // En production, il faudrait faire des appels fetch() aux URLs de tiles et les intégrer en base64
    return `
      <defs>
        <radialGradient id="satelliteGradient" cx="50%" cy="50%" r="70%">
          <stop offset="0%" style="stop-color:#4A7C8E;stop-opacity:1" />
          <stop offset="40%" style="stop-color:#5A8C9E;stop-opacity:1" />
          <stop offset="70%" style="stop-color:#6A9CAE;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2A4C5E;stop-opacity:1" />
        </radialGradient>
        <pattern id="terrainPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#satelliteGradient)"/>
          <circle cx="20" cy="30" r="15" fill="#3A5C6E" opacity="0.3"/>
          <circle cx="70" cy="60" r="20" fill="#5A7C8E" opacity="0.2"/>
          <circle cx="50" cy="80" r="12" fill="#4A6C7E" opacity="0.25"/>
        </pattern>
      </defs>
      <rect width="1000" height="1000" fill="url(#terrainPattern)" opacity="0.8"/>
      <rect width="1000" height="1000" fill="#E8F4F8" opacity="0.1"/>
      <!-- Tiles satellite: zoom=${zoom}, center=(${centerLat.toFixed(4)}, ${centerLon.toFixed(4)}), tile=(${xTile},${yTile}) -->`
  }

  async function fetchTilesForBbox(bbox: BBox): Promise<{
    tiles: Array<{ dataUrl: string, bounds: { north: number, south: number, west: number, east: number } }>,
    adjustedViewBox: { x: number, y: number, width: number, height: number }
  }> {
    const clampLat = (lat: number) => Math.max(-85, Math.min(85, lat))
    const clampLon = (lon: number) => Math.max(-180, Math.min(180, lon))

    const rawLatSpan = Math.max(1e-6, bbox.maxLat - bbox.minLat)
    const rawLonSpan = Math.max(1e-6, bbox.maxLon - bbox.minLon)
    const maxSpan = Math.max(rawLatSpan, rawLonSpan)

  // Utilise un padding généreux pour garantir que tous les points restent visibles
  // même lorsque le SVG est rendu avec preserveAspectRatio="slice" (le rendu peut
  // rogner ~25% de la largeur/hauteur suivant le ratio d'écran).
  const paddingFactor = 0.3
    const latPadding = Math.max(1e-5, rawLatSpan * paddingFactor)
    const lonPadding = Math.max(1e-5, rawLonSpan * paddingFactor)

    const paddedBBox: BBox = {
      minLat: clampLat(bbox.minLat - latPadding),
      maxLat: clampLat(bbox.maxLat + latPadding),
      minLon: clampLon(bbox.minLon - lonPadding),
      maxLon: clampLon(bbox.maxLon + lonPadding)
    }

    let zoom = 5
    if (maxSpan < 0.1) zoom = 13
    else if (maxSpan < 0.5) zoom = 11
    else if (maxSpan < 1) zoom = 10
    else if (maxSpan < 2) zoom = 9
    else if (maxSpan < 5) zoom = 8
    else if (maxSpan < 10) zoom = 7
    else if (maxSpan < 20) zoom = 6

  const MAX_TILES_PER_AXIS = 6
  const EXTRA_TILE_PADDING = 1

    const latLonToTile = (lat: number, lon: number, zoomLevel: number) => {
      const latRad = lat * Math.PI / 180
      const n = Math.pow(2, zoomLevel)
      const xTile = (lon + 180) / 360 * n
      const yTile = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n
      return { x: xTile, y: yTile }
    }

    const tileToLatLon = (x: number, y: number, zoomLevel: number) => {
      const n = Math.pow(2, zoomLevel)
      const lon = x / n * 360 - 180
      const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)))
      const lat = latRad * 180 / Math.PI
      return { lat, lon }
    }

    const computeTileRange = (zoomLevel: number) => {
      const nw = latLonToTile(paddedBBox.maxLat, paddedBBox.minLon, zoomLevel)
      const se = latLonToTile(paddedBBox.minLat, paddedBBox.maxLon, zoomLevel)
      return {
        minX: Math.floor(Math.min(nw.x, se.x)),
        maxX: Math.floor(Math.max(nw.x, se.x)),
        minY: Math.floor(Math.min(nw.y, se.y)),
        maxY: Math.floor(Math.max(nw.y, se.y))
      }
    }

    let range = computeTileRange(zoom)
    while ((range.maxX - range.minX + 1) > MAX_TILES_PER_AXIS || (range.maxY - range.minY + 1) > MAX_TILES_PER_AXIS) {
      if (zoom <= 3) break
      zoom -= 1
      range = computeTileRange(zoom)
    }

    const tileCount = Math.pow(2, zoom)
    const maxIndex = tileCount - 1

    let { minX, maxX, minY, maxY } = range

    const expandAxis = (currentMin: number, currentMax: number): { min: number, max: number } => {
      const currentCount = currentMax - currentMin + 1
      const available = Math.max(0, MAX_TILES_PER_AXIS - currentCount)
      if (!available) return { min: currentMin, max: currentMax }

      const expandMin = Math.min(EXTRA_TILE_PADDING, Math.min(available, currentMin))
      currentMin -= expandMin
      const remaining = Math.max(0, available - expandMin)
      const expandMax = Math.min(EXTRA_TILE_PADDING, Math.min(remaining, maxIndex - currentMax))
      currentMax += expandMax
      return { min: currentMin, max: currentMax }
    }

    const expandedX = expandAxis(minX, maxX)
    minX = expandedX.min
    maxX = expandedX.max

    const expandedY = expandAxis(minY, maxY)
    minY = expandedY.min
    maxY = expandedY.max

    const tilesX = maxX - minX + 1
    const tilesY = maxY - minY + 1

  DBG.log('tiles:fetching', { zoom, tilesX, tilesY, range: { minX, maxX, minY, maxY }, paddedBBox })

    const tileImages: Array<{
      dataUrl: string,
      bounds: { north: number, south: number, west: number, east: number }
    }> = []

    const promises: Promise<void>[] = []
    for (let tx = minX; tx <= maxX; tx++) {
      for (let ty = minY; ty <= maxY; ty++) {
        const tileUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${ty}/${tx}`
        promises.push(
          fetch(tileUrl)
            .then(resp => resp.blob())
            .then(blob => fileToDataUrl(new File([blob], 'tile.jpg')))
            .then(dataUrl => {
              const topLeft = tileToLatLon(tx, ty, zoom)
              const bottomRight = tileToLatLon(tx + 1, ty + 1, zoom)
              tileImages.push({
                dataUrl,
                bounds: {
                  north: topLeft.lat,
                  south: bottomRight.lat,
                  west: topLeft.lon,
                  east: bottomRight.lon
                }
              })
              DBG.log('tiles:fetched', { x: tx, y: ty, zoom })
            })
            .catch(err => {
              DBG.warn('tiles:fetch failed', { x: tx, y: ty, zoom, err })
            })
        )
      }
    }

    await Promise.all(promises)

    if (!tileImages.length) {
      DBG.warn('tiles:no tiles fetched, using fallback')
      return {
        tiles: [],
        adjustedViewBox: calculateViewBox(paddedBBox, 0)
      }
    }

    const coverageNW = tileToLatLon(minX, minY, zoom)
    const coverageSE = tileToLatLon(maxX + 1, maxY + 1, zoom)

    const adjustedViewBox = {
      x: coverageNW.lon,
      y: coverageSE.lat,
      width: Math.max(0.00001, coverageSE.lon - coverageNW.lon),
      height: Math.max(0.00001, coverageNW.lat - coverageSE.lat)
    }

    DBG.log('tiles:adjustedViewBox', adjustedViewBox)

    return { tiles: tileImages, adjustedViewBox }
  }

  async function buildMapSection(): Promise<string> {
    try {
      if (!trip.steps.length) return ''
      DBG.log('map:building section')

      const bbox = calculateBoundingBox(trip.steps)
      if (!bbox) return ''

      const { tiles, adjustedViewBox: viewBox } = await fetchTilesForBbox(bbox)
      DBG.log('map:tiles fetched', { tiles: tiles.length })

      let background = ''
      if (tiles.length) {
        const tilesLayers = tiles.map(tile => {
          const topLeft = latLonToSvg(tile.bounds.north, tile.bounds.west, viewBox)
          const bottomRight = latLonToSvg(tile.bounds.south, tile.bounds.east, viewBox)
          const x = Math.min(topLeft.x, bottomRight.x)
          const y = Math.min(topLeft.y, bottomRight.y)
          const width = Math.abs(bottomRight.x - topLeft.x)
          const height = Math.abs(bottomRight.y - topLeft.y)
          if (width <= 0 || height <= 0) return ''
          return `<image href="${tile.dataUrl}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="none"/>`
        }).filter(Boolean).join('\n')
        background = `
            <g class="map-tiles">
              ${tilesLayers}
            </g>
            <rect width="1000" height="1000" fill="#E8F4F8" opacity="0.05"/>`
      } else {
        background = generateSatelliteBackground(bbox)
      }

      // Génération du tracé de l'itinéraire avec le viewBox ajusté
      const pathData = generatePathData(trip.steps, viewBox)
      DBG.log('map:path generated', { length: pathData.length, steps: trip.steps.length })

      // Génération des vignettes d'étapes avec le viewBox ajusté
      const markers = generateStepMarkers(trip.steps, viewBox)
      DBG.log('map:markers generated', { count: trip.steps.length })

      return `
      <div class="break-after map-page">
        <div class="map-container">
          <svg class="map-svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
            ${background}
            ${pathData ? `<path class="map-route" d="${esc(pathData)}" fill="none" stroke="#FF6B6B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />` : ''}
            ${markers}
          </svg>
        </div>
      </div>`
    } catch (e) {
      DBG.warn('map:build error', e)
      return ''
    }
  }
  bodyHtml += await buildMapSection()

  // Parse éventuel du plan utilisateur pour imposer cover/pages
  type StepPlan = { cover?: number, pages: number[][] }
  const planByStep: Record<number, StepPlan> = {}
  if (userPlanText) {
    const lines = userPlanText.split(/\r?\n/)
    let currentId: number | null = null
    for (const raw of lines) {
      const line = raw.trim()
      if (!line) { currentId = null; continue }
      // Header: ... (123456)
      const m = line.match(/\((\d+)\)\s*$/)
      if (m) {
        currentId = Number(m[1])
        if (!planByStep[currentId]) planByStep[currentId] = { pages: [] }
        continue
      }
      if (currentId == null) continue
      const coverM = line.match(/^cover\s*photo\s*:\s*(\d+)$/i)
      if (coverM) {
        const idx = Number(coverM[1])
        if (!planByStep[currentId]) planByStep[currentId] = { pages: [] }
        planByStep[currentId].cover = idx
        continue
      }
      // Page line: numbers separated by spaces
      if (/^[0-9 ]+$/.test(line)) {
        const nums = line.split(/\s+/).map(n => Number(n)).filter(n => Number.isFinite(n))
        if (!planByStep[currentId]) planByStep[currentId] = { pages: [] }
        if (nums.length) planByStep[currentId].pages.push(nums)
      }
    }
    DBG.log('user-plan:parsed', { steps: Object.keys(planByStep).length })
  }

  for (const step of trip.steps) {
  const mapping = photosMapping[step.id] || {}
    const photosArr = Object.values(mapping) as any[]
    const portrait = photosArr.filter(p => p.ratio === 'PORTRAIT')
    const landscape = photosArr.filter(p => p.ratio === 'LANDSCAPE')
    const other = photosArr.filter(p => p.ratio === 'UNKNOWN')

    const useCover = !step.description || step.description.length < 800
    let cover: any | null = null
    const stepPlan = planByStep[step.id]
    if (stepPlan?.cover != null) {
      cover = photosArr.find(p => p.index === stepPlan.cover) || null
    } else if (useCover) {
      cover = portrait[0] ?? landscape[0] ?? null
    }

    // Pages: si plan utilisateur présent, le suivre strictement; sinon, heuristique par défaut
    let pages: any[][] = []
    if (stepPlan) {
      const coverIdx = cover?.index
      pages = stepPlan.pages.map(arr => arr
        .map(idx => photosArr.find(p => p.index === idx))
        .filter((p): p is any => !!p && (coverIdx ? p.index !== coverIdx : true))
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
  DBG.log('step:pages built', { count: pages.length, sizes: pages.map(p => p.length) })

    // Compute map dot position
    let dotStyle = ''
    if (step.country_code && step.country_code !== '00') {
      const pos = await getPositionPercentage(step.country_code, { lat: step.lat, lon: step.lon })
      if (pos) dotStyle = `style="top: ${pos.top}%; left: ${pos.left}%"`
  DBG.log('step:map dot', { code: step.country_code, pos: pos ?? null })
    }

  const stepDate = new Date(step.start_time * 1000)
  // Elevation (local, no network): lookup cache then format
  const elev = (step as any)._elev ?? await getElevation(step.lat, step.lon)
  const elevText = elev != null ? `${numberFr0(elev)}` : ''
  // Country in French (fallback to provided name uppercased)
  const cc = (step.country_code || '').toLowerCase()
  const countryHeading = COUNTRY_FR[cc] || countryNameFrFromCode(cc, step.country || cc)
  // Weather French label
  const wKey = normKey(step.weather_condition)
  const weatherText = (WEATHER_FR[wKey] || String(step.weather_condition || '').toUpperCase())

    const flagEmoji = (function ccToEmoji(cc: string) {
      cc = (cc || '').toUpperCase()
      if (cc.length !== 2) return ''
      const A = 127397
      const codePoints = [cc.charCodeAt(0) + A, cc.charCodeAt(1) + A]
      return String.fromCodePoint(...codePoints)
    })(step.country_code || '')

    const stepInfo = `
    <div class="text-content">
      <div class="step-cover">
        <div class="step-days">
          <div class="step-days-popup" style="left: ${tripPercentage(step)}%;">
            Jour ${dayNumber(step)}
            <div class="step-days-popup-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="15" viewBox="0 0 40 15" fill="none">
                <path d="M17.5012 0.999025C18.9621 -0.169674 21.0379 -0.169676 22.4988 0.999024L40 15H0L17.5012 0.999025Z"></path>
              </svg>
            </div>
          </div>
          <div class="step-days-bar">
            <div class="step-days-bar-fill" style="width: ${tripPercentage(step)}%;"></div>
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

    if (cover) {
      bodyHtml += `
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
      bodyHtml += `
      <div class="break-after">
        ${stepInfo}
      </div>`
    }

    // Pages
    for (const page of pages) {
      if (page.length <= 2) {
        // one_or_two
        const left = page[0]
        const right = page[1]
        bodyHtml += `
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
        bodyHtml += `
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
  }

  const html = `<!DOCTYPE html>
<html lang="en">
${headHtml}
<body>
${bodyHtml}
</body>
</html>`

  manifest['travel_book.html'] = new Blob([html], { type: 'text/html' })
  DBG.log('html:travel_book generated', { size: html.length })
  DBG.log('generateArtifacts:done', { manifestEntries: Object.keys(manifest).length })

  return { manifest }
}

// Construit un HTML autonome (single-file) à partir des artefacts: inline CSS, fontes et assets en data: URLs
export async function buildSingleFileHtml(artifacts: GeneratedArtifacts): Promise<Blob> {
  const manifest = artifacts.manifest
  const tb = manifest['travel_book.html']
  if (!tb) return new Blob(['<html><body>Missing travel_book.html</body></html>'], { type: 'text/html' })
  DBG.log('single-file:start', { assets: Object.keys(manifest).length })

  const blobToText = (b: Blob) => b.text()
  const blobToDataUrl = (b: Blob) => new Promise<string>((res, rej) => {
    const fr = new FileReader()
    fr.onload = () => res(String(fr.result))
    fr.onerror = rej
    fr.readAsDataURL(b)
  })

  // Table path -> dataURL
  const dataUrlMap: Record<string, string> = {}
  for (const [key, blob] of Object.entries(manifest)) {
    if (key === 'travel_book.html') continue
    dataUrlMap[key] = await blobToDataUrl(blob)
  }
  DBG.log('single-file:dataUrlMap built', { assets: Object.keys(dataUrlMap).length })

  // 1) Charger le HTML
  let html = await blobToText(tb)

  // 2) Inline CSS (style.css + fonts.css) et retirer les <link>
  const styles: string[] = []
  if (manifest['assets/style.css']) {
    styles.push(await blobToText(manifest['assets/style.css']))
    html = html.replace(/<link[^>]+href=["']assets\/style\.css["'][^>]*>/i, '')
  }
  if (manifest['assets/fonts/fonts.css']) {
    let fontsCss = await blobToText(manifest['assets/fonts/fonts.css'])
    // Supprimer les @font-face pour les fontes absentes du manifest (BrandonGrotesque, Noto Serif)
    const hasBrandon = !!dataUrlMap['assets/fonts/Brandon_Grotesque_medium.otf']
    const hasAnyNoto = ['assets/fonts/NotoSerif-Regular.woff2','assets/fonts/NotoSerif-Italic.woff2','assets/fonts/NotoSerif-Bold.woff2','assets/fonts/NotoSerif-BoldItalic.woff2']
      .some(k => !!dataUrlMap[k])
    if (!hasBrandon) {
      fontsCss = fontsCss.replace(/@font-face\s*\{[\s\S]*?font-family:\s*["']BrandonGrotesque["'][\s\S]*?\}/gi, '')
    }
    if (!hasAnyNoto) {
      fontsCss = fontsCss.replace(/@font-face\s*\{[\s\S]*?font-family:\s*["']Noto Serif["'][\s\S]*?\}/gi, '')
    }
    // Réécrire toutes les url(...) vers data: URLs, y compris chemins relatifs et caractères spéciaux
    fontsCss = fontsCss.replace(/url\((["']?)([^)\s'"%]+)\1\)/g, (_m, _q, rawPath) => {
      if (/^data:/.test(rawPath)) return _m
      let key = rawPath
      if (!/^assets\//.test(key)) {
        key = 'assets/fonts/' + key.replace(/^\.\/?/, '')
      }
      const u = dataUrlMap[key]
      return u ? `url(${JSON.stringify(u)})` : _m
    })
    styles.push(fontsCss)
    html = html.replace(/<link[^>]+href=["']assets\/fonts\/fonts\.css["'][^>]*>/i, '')
  }
  if (styles.length) {
    const styleTag = `<style>${styles.join('\n')}</style>`
    html = html.replace(/<head>([\s\S]*?)<\/head>/i, (m, inner) => `<head>${inner}\n${styleTag}</head>`)
  DBG.log('single-file:styles inlined', { blocks: styles.length })
  }

  // 3) Réécrire tous les href/src="assets/..." et url(assets/...) inline vers data: URLs
  html = html.replace(/\b(href|src)=["'](assets\/[^"']+)["']/g, (_m, attr, path) => {
    const u = dataUrlMap[path]
    return u ? `${attr}=${JSON.stringify(u)}` : _m
  })
  // url('assets/...') ou url("assets/...")
  html = html.replace(/url\((["'])(assets\/[^)'"]+)\1\)/g, (_m, _q, path) => {
    const u = dataUrlMap[path]
    return u ? `url(${JSON.stringify(u)})` : _m
  })
  // url(assets/...) sans guillemets
  html = html.replace(/url\((assets\/[^)]+)\)/g, (_m, path) => {
    const u = dataUrlMap[path]
    return u ? `url(${JSON.stringify(u)})` : _m
  })
  DBG.log('single-file:assets inlined')

  return new Blob([html], { type: 'text/html' })
}

// Variante pratique: retourne l'HTML autonome sous forme de chaîne
export async function buildSingleFileHtmlString(artifacts: GeneratedArtifacts): Promise<string> {
  const blob = await buildSingleFileHtml(artifacts)
  const text = await blob.text()
  DBG.log('single-file:ready', { length: text.length })
  return text
}
