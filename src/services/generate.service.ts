import { FFInput } from './fs.service'
import { Trip, Step } from '../models/types'
import { getElevationsBulk } from './elevation.service'
import { buildCoverSection } from './builders/cover.builder'
import { buildStatsSection } from './builders/stats.builder'
import { buildMapSection } from './builders/map.builder'
import { buildStepSection } from './builders/step.builder'

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
  bodyHtml += buildCoverSection({ trip, photosMapping, photoDataUrlMap })

  // --- Page Statistiques --------------------------------------------------
  bodyHtml += buildStatsSection({ trip, photosMapping })

  // --- Page Carte ---------------------------------------------------------
  bodyHtml += await buildMapSection({ trip, photosMapping, photoDataUrlMap })

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

  // --- Pages Étapes -------------------------------------------------------
  for (const step of trip.steps) {
    const stepHtml = await buildStepSection({
      trip,
      step,
      photosMapping,
      photoDataUrlMap,
      stepPlan: planByStep[step.id]
    })
    bodyHtml += stepHtml
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
