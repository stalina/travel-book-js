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
