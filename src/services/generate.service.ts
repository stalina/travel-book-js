import { FFInput } from './fs.service'
import { Trip } from '../models/types'
import { elevationService, ElevationService } from './elevation.service'
import { CoverBuilder } from './builders/cover.builder'
import { StatsBuilder } from './builders/stats.builder'
import { MapBuilder } from './builders/map.builder'
import { StepBuilder } from './builders/step.builder'
import type { StepGenerationPlan } from '../models/editor.types'
import { loggerService, LoggerService } from './logger.service'

export type GeneratedArtifacts = {
  manifest: Record<string, Blob>
}

export type GenerateOptions = {
  photosPlan?: string // contenu texte de photos_by_pages.txt permettant d'écraser la pagination auto
}

type StepPlan = StepGenerationPlan

/**
 * ArtifactGenerator - Orchestrateur principal pour la génération d'artefacts de voyage
 * 
 * Coordonne tous les builders (Cover, Stats, Map, Step) et services pour produire
 * un travel book HTML complet avec assets embarqués.
 */
export class ArtifactGenerator {
  private constructor(
    private readonly elevationService: ElevationService,
    private readonly loggerService: LoggerService
  ) {}

  /**
   * Génère tous les artefacts (HTML, CSS, fonts, photos, cartes) pour un voyage
   * 
   * @param input - Source de données (FileList ou DirectoryHandle)
   * @param options - Options de génération (plan photos personnalisé)
   * @returns Manifest des artefacts générés
   */
  public async generate(input: FFInput, options?: GenerateOptions): Promise<GeneratedArtifacts> {
    const { trip, stepPhotos } = (window as any).__parsedTrip as { trip: Trip, stepPhotos: Record<number, File[]> }
    if (!trip) throw new Error('Trip non parsé')
    
    this.loggerService.info('generate', 'Début de la génération', { tripId: (trip as any).id, steps: trip.steps.length })
    this.loggerService.time('generateArtifacts')

    const manifest: Record<string, Blob> = {}
    const photoDataUrlMap: Record<string, string> = {}

    // 1. Charger les assets CSS et fonts
    await this.loadAssets(manifest)

    // 2. Précharger les altitudes en masse
    await this.preloadElevations(trip)

    // 3. Traiter les photos (mapping, ratios, data URLs)
    const photosMapping = await this.processPhotos(trip, stepPhotos, manifest, photoDataUrlMap)

    // 4. Générer le plan de pagination photos
    const photosByPagesLines = this.generatePhotosPlan(trip, photosMapping)
    const userPlanText = options?.photosPlan?.trim() || ''
    
    const mappingBlob = new Blob([JSON.stringify(photosMapping, null, 4)], { type: 'application/json' })
    const pagesBlob = new Blob([userPlanText || photosByPagesLines.join('\n')], { type: 'text/plain' })
    manifest['photos_mapping.json'] = mappingBlob
    manifest['photos_by_pages.txt'] = pagesBlob

    // 5. Charger les cartes SVG des pays
    await this.loadCountryMaps(trip, manifest)

    // 6. Construire le HTML
    const headHtml = await this.buildHtmlHead()
    const planByStep = this.parseUserPlan(userPlanText)
    const bodyHtml = await this.buildHtmlBody(trip, photosMapping, photoDataUrlMap, planByStep)

    const html = `<!DOCTYPE html>
<html lang="en">
${headHtml}
<body>
${bodyHtml}
</body>
</html>`

    manifest['travel_book.html'] = new Blob([html], { type: 'text/html' })
    
    this.loggerService.timeEnd('generateArtifacts', true)
    this.loggerService.info('generate', 'Génération terminée', { manifestEntries: Object.keys(manifest).length })

    return { manifest }
  }

  /**
   * Charge les assets CSS et fonts dans le manifest
   */
  private async loadAssets(manifest: Record<string, Blob>): Promise<void> {
    this.loggerService.info('generate', 'Chargement des assets CSS et fonts')
    
    const cssResp = await fetch('/assets/style.css')
    const cssText = await cssResp.text()
    const fontsCssResp = await fetch('/assets/fonts/fonts.css')
    const fontsCssText = await fontsCssResp.text()
    
    manifest['assets/style.css'] = new Blob([cssText], { type: 'text/css' })
    manifest['assets/fonts/fonts.css'] = new Blob([fontsCssText], { type: 'text/css' })

    // Brandon Grotesque font
    try {
      const fontResp = await fetch('/assets/fonts/Brandon_Grotesque_medium.otf')
      if (fontResp.ok) {
        const ct = fontResp.headers.get('content-type') || ''
        if (!/text\/html/i.test(ct)) {
          const fontBlob = await fontResp.blob()
          manifest['assets/fonts/Brandon_Grotesque_medium.otf'] = fontBlob
          this.loggerService.debug('generate', 'Font Brandon_Grotesque_medium.otf inclus', { size: fontBlob.size })
        }
      }
    } catch {}

    // Noto Serif fonts
    for (const f of ['NotoSerif-Regular.woff2', 'NotoSerif-Italic.woff2', 'NotoSerif-Bold.woff2', 'NotoSerif-BoldItalic.woff2']) {
      try {
        const resp = await fetch(`/assets/fonts/${f}`)
        if (resp.ok) {
          const ct = resp.headers.get('content-type') || ''
          if (!/text\/html/i.test(ct)) {
            manifest[`assets/fonts/${f}`] = await resp.blob()
            this.loggerService.debug('generate', `Font inclus: ${f}`)
          }
        }
      } catch {}
    }
  }

  /**
   * Précharge les altitudes pour toutes les étapes en masse
   */
  private async preloadElevations(trip: Trip): Promise<void> {
    this.loggerService.info('generate', 'Chargement des altitudes en masse')
    try {
      const bulkElev = await this.elevationService.getElevationsBulk(
        trip.steps.map(s => ({ lat: s.lat, lon: s.lon }))
      )
      let countOk = 0
      trip.steps.forEach((s, i) => {
        const e = bulkElev[i]
        if (e != null) {
          ;(s as any)._elev = e
          countOk++
        }
      })
      this.loggerService.debug('generate', 'Altitudes chargées', { total: trip.steps.length, resolved: countOk })
    } catch {}
  }

  /**
   * Traite les photos de toutes les étapes : calcul ratios, data URLs, manifest
   */
  private async processPhotos(
    trip: Trip,
    stepPhotos: Record<number, File[]>,
    manifest: Record<string, Blob>,
    photoDataUrlMap: Record<string, string>
  ): Promise<Record<number, Record<number, any>>> {
    this.loggerService.info('generate', `Traitement de ${trip.steps.length} étapes`)
    
    const photosMapping: Record<number, Record<number, any>> = {}

    for (const step of trip.steps) {
      const photos = stepPhotos[step.id] || []
      const mapping: Record<number, any> = {}
      let idx = 1

      for (const f of photos) {
        const url = this.normalizePath('assets/images/photos', f.name)
        manifest[url] = f

        try {
          photoDataUrlMap[url] = await this.fileToDataUrl(f)
        } catch {}

        let ratio: 'PORTRAIT' | 'LANDSCAPE' | 'UNKNOWN' = 'UNKNOWN'
        try {
          const bmp = await createImageBitmap(f)
          ratio = this.guessRatio(bmp.width, bmp.height)
        } catch {}

        mapping[idx] = { id: f.name, index: idx, path: url, ratio }
        idx++
      }

      photosMapping[step.id] = mapping
    }

    return photosMapping
  }

  /**
   * Génère le plan de pagination automatique des photos (photos_by_pages.txt)
   */
  private generatePhotosPlan(trip: Trip, photosMapping: Record<number, Record<number, any>>): string[] {
    const photosByPagesLines: string[] = []

    for (const step of trip.steps) {
      const mapping = photosMapping[step.id] || {}
      
      const portrait = Object.values(mapping).filter(p => p.ratio === 'PORTRAIT')
      const landscape = Object.values(mapping).filter(p => p.ratio === 'LANDSCAPE')
      const other = Object.values(mapping).filter(p => p.ratio === 'UNKNOWN')

      // Header
      const start = new Date(step.start_time * 1000)
      const header = `${String(start.getDate()).padStart(2, '0')}/${String(start.getMonth()+1).padStart(2,'0')}/${start.getFullYear()} ${step.name} (${step.id})`
      photosByPagesLines.push(header)

      // Cover if description short
      const useCover = !step.description || step.description.length < 800
      if (useCover && (portrait[0] || landscape[0])) {
        const cover = portrait[0] ?? landscape[0]
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
    }

    return photosByPagesLines
  }

  /**
   * Charge les cartes SVG des pays utilisés dans le voyage
   */
  private async loadCountryMaps(trip: Trip, manifest: Record<string, Blob>): Promise<void> {
    this.loggerService.info('generate', 'Chargement des cartes SVG des pays')
    
    const usedCountries = Array.from(
      new Set(trip.steps.map(s => s.country_code).filter(c => c && c !== '00'))
    )

    for (const code of usedCountries) {
      const localUrl = `/assets/images/maps/${code.toLowerCase()}.svg`
      try {
        const resp = await fetch(localUrl, { cache: 'no-store' })
        if (resp.ok) {
          const svg = await resp.blob()
          manifest[`assets/images/maps/${code.toLowerCase()}.svg`] = svg
          this.loggerService.debug('generate', `Carte SVG incluse: ${code}`, { size: svg.size })
        } else {
          manifest[`assets/images/maps/${code.toLowerCase()}.svg`] = this.createPlaceholderSvg(code)
          this.loggerService.debug('generate', `Placeholder utilisé pour: ${code}`)
        }
      } catch {
        manifest[`assets/images/maps/${code.toLowerCase()}.svg`] = this.createPlaceholderSvg(code)
        this.loggerService.debug('generate', `Placeholder utilisé (exception) pour: ${code}`)
      }
    }
  }

  /**
   * Construit la section <head> du HTML
   */
  private async buildHtmlHead(): Promise<string> {
    let headHtml = `
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PolarSteps Travel book</title>
    <link rel="stylesheet" href="assets/style.css" />
    <link rel="stylesheet" href="assets/fonts/fonts.css" />
  </head>`

    try {
      const headTpl = await fetch('/templates/index.html').then(r => r.text())
      const match = headTpl.match(/<head>[\s\S]*?<\/head>/i)
      if (match) {
        let h = match[0]
        h = h
          .replace(/<link[^>]+flag-icons[^>]*>/ig, '')
          .replace(/<link[^>]+fonts\.googleapis[^>]*>/ig, '')
          .replace(/<link[^>]+fonts\.gstatic[^>]*>/ig, '')
          .replace(/<link[^>]+rel=["']preconnect["'][^>]*>/ig, '')
        
        if (!/assets\/style\.css/.test(h)) h = h.replace(/<\/head>/i, '<link rel="stylesheet" href="assets/style.css" />\n</head>')
        if (!/assets\/fonts\/fonts\.css/.test(h)) h = h.replace(/<\/head>/i, '<link rel="stylesheet" href="assets/fonts/fonts.css" />\n</head>')
        
        headHtml = h
        this.loggerService.debug('generate', 'Template HTML personnalisé appliqué')
      }
    } catch {}

    return headHtml
  }

  /**
   * Parse le plan utilisateur (photos_by_pages.txt personnalisé)
   */
  private parseUserPlan(userPlanText: string): Record<number, StepPlan> {
    const planByStep: Record<number, StepPlan> = {}
    
    if (!userPlanText) return planByStep

    const lines = userPlanText.split(/\r?\n/)
    let currentId: number | null = null

    for (const raw of lines) {
      const line = raw.trim()
      if (!line) {
        currentId = null
        continue
      }

      // Header: ... (123456)
      const m = line.match(/\((\d+)\)\s*$/)
      if (m) {
        currentId = Number(m[1])
        if (!planByStep[currentId]) planByStep[currentId] = { pages: [] }
        continue
      }

      if (currentId == null) continue

      // Cover photo
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

    this.loggerService.debug('generate', 'Plan utilisateur parsé', { steps: Object.keys(planByStep).length })
    return planByStep
  }

  /**
   * Construit le corps HTML en orchestrant tous les builders
   */
  private async buildHtmlBody(
    trip: Trip,
    photosMapping: Record<number, Record<number, any>>,
    photoDataUrlMap: Record<string, string>,
    planByStep: Record<number, StepPlan>
  ): Promise<string> {
    let bodyHtml = ''

    // Couverture
    this.loggerService.info('generate', 'Génération de la page de couverture')
    const coverBuilder = new CoverBuilder(trip, photosMapping, photoDataUrlMap)
    bodyHtml += coverBuilder.build()

    // Statistiques
    this.loggerService.info('generate', 'Génération de la page de statistiques')
    const statsBuilder = new StatsBuilder(trip, photosMapping)
    bodyHtml += statsBuilder.build()

    // Carte
    this.loggerService.info('generate', 'Génération de la page carte')
    const mapBuilder = new MapBuilder(trip, photosMapping, photoDataUrlMap)
    bodyHtml += await mapBuilder.build()

    // Étapes
    this.loggerService.info('generate', `Génération des pages pour ${trip.steps.length} étapes`)
    for (const step of trip.steps) {
      const stepBuilder = new StepBuilder(trip, step, photosMapping, photoDataUrlMap, planByStep[step.id])
      bodyHtml += await stepBuilder.build()
    }

    return bodyHtml
  }

  // Utility methods
  private normalizePath(...parts: string[]): string {
    return parts.join('/').replace(/\\/g, '/')
  }

  private guessRatio(w: number, h: number): 'PORTRAIT' | 'LANDSCAPE' | 'UNKNOWN' {
    const ratio = w / h
    if (Math.abs(ratio - 9/16) < 0.1 || Math.abs(ratio - 3/4) < 0.1) return 'PORTRAIT'
    if (Math.abs(ratio - 16/9) < 0.1 || Math.abs(ratio - 4/3) < 0.1) return 'LANDSCAPE'
    return 'UNKNOWN'
  }

  private async fileToDataUrl(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(r.result as string)
      r.onerror = rej
      r.readAsDataURL(file)
    })
  }

  private createPlaceholderSvg(code: string): Blob {
    return new Blob([
      `<?xml version="1.0" encoding="UTF-8"?>\n`+
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">`+
      `<rect width="100%" height="100%" fill="#e7ecf4"/>`+
      `<g fill="#4b5a6c">`+
      `<rect x="100" y="150" width="600" height="300" rx="24" ry="24" opacity="0.25"/>`+
      `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="56" fill="#4b5a6c">${code.toUpperCase()}</text>`+
      `</g>`+
      `</svg>`
    ], { type: 'image/svg+xml' })
  }

  // Singleton instance
  private static instance: ArtifactGenerator | null = null

  public static getInstance(): ArtifactGenerator {
    if (!ArtifactGenerator.instance) {
      ArtifactGenerator.instance = new ArtifactGenerator(elevationService, loggerService)
    }
    return ArtifactGenerator.instance
  }

  /**
   * Construit un HTML autonome (single-file) : inline CSS, fonts et assets en data: URLs
   */
  public async buildSingleFileHtml(artifacts: GeneratedArtifacts): Promise<Blob> {
    const manifest = artifacts.manifest
    const tb = manifest['travel_book.html']
    if (!tb) return new Blob(['<html><body>Missing travel_book.html</body></html>'], { type: 'text/html' })
    
    this.loggerService.info('generate', 'Construction du fichier HTML autonome')
    this.loggerService.time('buildSingleFileHtml')

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

    // 1) Charger le HTML
    let html = await blobToText(tb)

    // 2) Inline CSS
    const styles: string[] = []
    if (manifest['assets/style.css']) {
      styles.push(await blobToText(manifest['assets/style.css']))
      html = html.replace(/<link[^>]+href=["']assets\/style\.css["'][^>]*>/i, '')
    }
    if (manifest['assets/fonts/fonts.css']) {
      let fontsCss = await blobToText(manifest['assets/fonts/fonts.css'])
      
      const hasBrandon = !!dataUrlMap['assets/fonts/Brandon_Grotesque_medium.otf']
      const hasAnyNoto = ['assets/fonts/NotoSerif-Regular.woff2','assets/fonts/NotoSerif-Italic.woff2','assets/fonts/NotoSerif-Bold.woff2','assets/fonts/NotoSerif-BoldItalic.woff2']
        .some(k => !!dataUrlMap[k])
      
      if (!hasBrandon) {
        fontsCss = fontsCss.replace(/@font-face\s*\{[\s\S]*?font-family:\s*["']BrandonGrotesque["'][\s\S]*?\}/gi, '')
      }
      if (!hasAnyNoto) {
        fontsCss = fontsCss.replace(/@font-face\s*\{[\s\S]*?font-family:\s*["']Noto Serif["'][\s\S]*?\}/gi, '')
      }
      
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
    }

    // 3) Réécrire tous les href/src/url vers data: URLs
    html = html.replace(/\b(href|src)=["'](assets\/[^"']+)["']/g, (_m, attr, path) => {
      const u = dataUrlMap[path]
      return u ? `${attr}=${JSON.stringify(u)}` : _m
    })
    html = html.replace(/url\((["'])(assets\/[^)'"]+)\1\)/g, (_m, _q, path) => {
      const u = dataUrlMap[path]
      return u ? `url(${JSON.stringify(u)})` : _m
    })
    html = html.replace(/url\((assets\/[^)]+)\)/g, (_m, path) => {
      const u = dataUrlMap[path]
      return u ? `url(${JSON.stringify(u)})` : _m
    })

    this.loggerService.timeEnd('buildSingleFileHtml', true)
    return new Blob([html], { type: 'text/html' })
  }

  /**
   * Retourne l'HTML autonome sous forme de chaîne
   */
  public async buildSingleFileHtmlString(artifacts: GeneratedArtifacts): Promise<string> {
    const blob = await this.buildSingleFileHtml(artifacts)
    const text = await blob.text()
    this.loggerService.info('generate', 'Fichier HTML autonome prêt', { size: text.length })
    return text
  }
}

// Export singleton instance
export const artifactGenerator = ArtifactGenerator.getInstance()
