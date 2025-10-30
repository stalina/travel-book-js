import { Trip } from '../../models/types'
import { escapeForCssUrlSingleQuotes, esc } from './utils'
import { loggerService } from '../logger.service'


type BBox = { 
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number 
}

type SvgCoord = { 
  x: number
  y: number 
}

type ViewBox = { 
  x: number
  y: number
  width: number
  height: number 
}

/**
 * Builder pour générer la page cartographique du voyage
 * Prend le voyage, le mapping des photos et les data URLs via le constructeur
 */
export class MapBuilder {
  /**
   * Crée une instance de MapBuilder
   * @param trip - Le voyage complet avec toutes les étapes
   * @param photosMapping - Mapping des photos par étape
   * @param photoDataUrlMap - Mapping des URLs vers data URLs
   */
  constructor(
    private readonly trip: Trip,
    private readonly photosMapping: Record<number, Record<number, any>>,
    private readonly photoDataUrlMap: Record<string, string>
  ) {}

  /**
   * Génère le HTML complet de la page cartographique
   * @returns Promise<string> HTML de la page carte ou chaîne vide si aucune étape
   */
  public async build(): Promise<string> {
    try {
      if (!this.trip.steps.length) return ''
      
      loggerService.debug('MapBuilder', 'Construction de la section carte')

      const bbox = this.calculateBoundingBox()
      if (!bbox) return ''

      const { tiles, adjustedViewBox: viewBox } = await this.fetchTilesForBbox(bbox)
      loggerService.debug('MapBuilder', 'Tuiles satellite récupérées', { count: tiles.length })
      loggerService.debug('MapBuilder', 'ViewBox utilisé pour le rendu', viewBox)

      // Vérifier que toutes les étapes sont dans le viewBox
      const stepsOutside = this.trip.steps.filter(step => {
        return step.lat < viewBox.y || 
               step.lat > viewBox.y + viewBox.height || 
               step.lon < viewBox.x || 
               step.lon > viewBox.x + viewBox.width
      })
      if (stepsOutside.length > 0) {
        loggerService.warn('MapBuilder', 'Certaines étapes sont hors du viewBox', { 
          count: stepsOutside.length,
          steps: stepsOutside.map(s => ({ name: s.name, lat: s.lat, lon: s.lon }))
        })
      }

      const background = this.generateBackground(tiles, bbox, viewBox)
      const pathData = this.generatePathData(viewBox)
      const markers = this.generateStepMarkers(viewBox)

      loggerService.debug('MapBuilder', 'Tracé de l\'itinéraire généré', { length: pathData.length, steps: this.trip.steps.length })
      loggerService.debug('MapBuilder', 'Vignettes d\'étapes générées', { count: this.trip.steps.length })

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
      loggerService.error('map-builder', 'Erreur lors de la génération de la carte', e)
      return ''
    }
  }

  /**
   * Calcule la bounding box englobant toutes les étapes
   */
  private calculateBoundingBox(): BBox | null {
    if (!this.trip.steps.length) return null
    let minLat = Infinity, maxLat = -Infinity
    let minLon = Infinity, maxLon = -Infinity
    for (const s of this.trip.steps) {
      if (s.lat < minLat) minLat = s.lat
      if (s.lat > maxLat) maxLat = s.lat
      if (s.lon < minLon) minLon = s.lon
      if (s.lon > maxLon) maxLon = s.lon
    }
    return { minLat, maxLat, minLon, maxLon }
  }

  /**
   * Calcule le viewBox SVG avec padding
   */
  private calculateViewBox(bbox: BBox, padding: number = 0.1): ViewBox {
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

    /**
   * Convertit des coordonnées géographiques en coordonnées SVG
   */
  private latLonToSvg(lat: number, lon: number, viewBox: ViewBox): SvgCoord {
    const x = ((lon - viewBox.x) / viewBox.width) * 1000
    const y = ((viewBox.y + viewBox.height - lat) / viewBox.height) * 1000
    return { x, y }
  }

  /**
   * Génère les données du path SVG pour le tracé
   */
  private generatePathData(viewBox: ViewBox): string {
    if (!this.trip.steps.length) return ''
    if (this.trip.steps.length === 1) return '' // Une seule étape : pas de ligne
    
    let d = ''
    for (let i = 0; i < this.trip.steps.length; i++) {
      const step = this.trip.steps[i]
      const coord = this.latLonToSvg(step.lat, step.lon, viewBox)
      d += (i === 0 ? 'M' : 'L') + ` ${coord.x.toFixed(2)} ${coord.y.toFixed(2)} `
    }
    return d
  }

  /**
   * Génère les vignettes SVG des étapes
   */
  private generateStepMarkers(viewBox: ViewBox): string {
    let markers = ''
    for (const step of this.trip.steps) {
      const coord = this.latLonToSvg(step.lat, step.lon, viewBox)
      // Récupérer la photo principale de l'étape
      const stepMapping = this.photosMapping[step.id]
      const photos = stepMapping ? Object.values(stepMapping) as any[] : []
      const mainPhoto = photos.length > 0 ? photos[0] : null
      
      // Résoudre l'URL de la photo (data URL ou URL distante)
      let photoUrl = ''
      if (mainPhoto) {
        const rawUrl = mainPhoto.path
        photoUrl = this.photoDataUrlMap[rawUrl] || rawUrl
      }
      
      // Générer la vignette avec foreignObject pour utiliser HTML/CSS
      const bgStyle = photoUrl 
        ? `background-image: url(${photoUrl.startsWith('data:') ? photoUrl : `'${escapeForCssUrlSingleQuotes(photoUrl)}'`});`
        : 'background: var(--theme-color);'
      
      const iconFallback = photoUrl ? '' : '<div class="map-marker-icon">📍</div>'
      
      const markerSize = 40 // pixels
      markers += `
        <foreignObject x="${(coord.x - markerSize/2).toFixed(2)}" y="${(coord.y - markerSize/2).toFixed(2)}" width="${markerSize}" height="${markerSize}">
          <div xmlns="http://www.w3.org/1999/xhtml" class="map-marker" style="${bgStyle} background-size: cover; background-position: center;">
            ${iconFallback}
          </div>
        </foreignObject>`
    }
    return markers
  }

  /**
   * Récupère les tuiles satellites pour une bbox donnée
   */
  private async fetchTilesForBbox(bbox: BBox): Promise<{
    tiles: Array<{ dataUrl: string, bounds: { north: number, south: number, west: number, east: number } }>,
    adjustedViewBox: ViewBox
  }> {
    const clampLat = (lat: number) => Math.max(-85, Math.min(85, lat))
    const clampLon = (lon: number) => Math.max(-180, Math.min(180, lon))

    // Utilise un padding généreux pour garantir que tous les points restent visibles
    const rawLatSpan = Math.max(1e-6, bbox.maxLat - bbox.minLat)
    const rawLonSpan = Math.max(1e-6, bbox.maxLon - bbox.minLon)
    const paddingFactor = 0.3
    const latPadding = Math.max(1e-5, rawLatSpan * paddingFactor)
    const lonPadding = Math.max(1e-5, rawLonSpan * paddingFactor)

    const paddedBBox: BBox = {
      minLat: clampLat(bbox.minLat - latPadding),
      maxLat: clampLat(bbox.maxLat + latPadding),
      minLon: clampLon(bbox.minLon - lonPadding),
      maxLon: clampLon(bbox.maxLon + lonPadding)
    }

    const lonSpan = paddedBBox.maxLon - paddedBBox.minLon
    const latSpan = paddedBBox.maxLat - paddedBBox.minLat
    const maxSpan = Math.max(lonSpan, latSpan)
    let zoom = 8
    if (maxSpan < 0.05) zoom = 14
    else if (maxSpan < 0.1) zoom = 13
    else if (maxSpan < 0.2) zoom = 12
    else if (maxSpan < 0.5) zoom = 11
    else if (maxSpan < 1) zoom = 10
    else if (maxSpan < 2) zoom = 9
    else if (maxSpan < 5) zoom = 8
    else if (maxSpan < 10) zoom = 7
    else zoom = 6

    const lat2tile = (lat: number, z: number) => {
      const latRad = lat * Math.PI / 180
      return Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * Math.pow(2, z))
    }
    const lon2tile = (lon: number, z: number) => Math.floor((lon + 180) / 360 * Math.pow(2, z))
    const tile2lat = (y: number, z: number) => {
      const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z)
      return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
    }
    const tile2lon = (x: number, z: number) => x / Math.pow(2, z) * 360 - 180

    const xMin = lon2tile(paddedBBox.minLon, zoom)
    const xMax = lon2tile(paddedBBox.maxLon, zoom)
    const yMin = lat2tile(paddedBBox.maxLat, zoom)
    const yMax = lat2tile(paddedBBox.minLat, zoom)

    const tileImages: Array<{ dataUrl: string, bounds: { north: number, south: number, west: number, east: number } }> = []
    const fetchPromises = []

    // Pas de limitation - télécharge toutes les tuiles nécessaires
    let tileCount = 0
    const potentialTiles = (xMax - xMin + 1) * (yMax - yMin + 1)

    loggerService.debug('map-builder', 'Début fetch tuiles', { zoom, xMin, xMax, yMin, yMax, potentialTiles })

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        tileCount++
        const tileUrl = `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`
        const north = tile2lat(y, zoom)
        const south = tile2lat(y + 1, zoom)
        const west = tile2lon(x, zoom)
        const east = tile2lon(x + 1, zoom)

        fetchPromises.push(
          fetch(tileUrl)
            .then(r => {
              loggerService.debug('map-builder', 'Réponse tuile', { url: tileUrl, ok: r.ok, status: r.status })
              return r.ok ? r.blob() : null
            })
            .then(blob => {
              if (!blob) {
                loggerService.warn('map-builder', 'Pas de blob pour tuile', { url: tileUrl })
                return null
              }
              return new Promise<string | null>((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result as string)
                reader.onerror = () => {
                  loggerService.error('map-builder', 'Erreur lecture blob', tileUrl)
                  resolve(null)
                }
                reader.readAsDataURL(blob)
              })
            })
            .then(dataUrl => {
              if (dataUrl) {
                loggerService.debug('map-builder', 'Tuile convertie en dataURL', { url: tileUrl })
                tileImages.push({ dataUrl, bounds: { north, south, west, east } })
              }
            })
            .catch((err) => {
              loggerService.error('map-builder', 'Erreur fetch tuile', { url: tileUrl, error: err })
            })
        )
      }
    }

    await Promise.all(fetchPromises)
    loggerService.debug('map-builder', 'Tuiles satellite récupérées', { count: tileImages.length, requested: tileCount })

    if (!tileImages.length) {
      loggerService.warn('map-builder', 'Aucune tuile récupérée, utilisation du fallback')
      return {
        tiles: [],
        adjustedViewBox: this.calculateViewBox(paddedBBox, 0)
      }
    }

    // Calculer le viewBox basé sur la couverture réelle des tuiles
    const coverageNW = { lat: tile2lat(yMin, zoom), lon: tile2lon(xMin, zoom) }
    const coverageSE = { lat: tile2lat(yMax + 1, zoom), lon: tile2lon(xMax + 1, zoom) }

    const adjustedViewBox: ViewBox = {
      x: coverageNW.lon,
      y: coverageSE.lat,
      width: Math.max(0.00001, coverageSE.lon - coverageNW.lon),
      height: Math.max(0.00001, coverageNW.lat - coverageSE.lat)
    }

    loggerService.debug('map-builder', 'ViewBox ajustée calculée', adjustedViewBox)

    return {
      tiles: tileImages,
      adjustedViewBox
    }
  }

  /**
   * Génère le fond de carte (tuiles satellite ou fallback)
   */
  private generateBackground(tiles: Array<{ dataUrl: string, bounds: { north: number, south: number, west: number, east: number } }>, bbox: BBox, viewBox: ViewBox): string {
    if (tiles.length) {
      const tilesLayers = tiles.map(tile => {
        const topLeft = this.latLonToSvg(tile.bounds.north, tile.bounds.west, viewBox)
        const bottomRight = this.latLonToSvg(tile.bounds.south, tile.bounds.east, viewBox)
        const x = Math.min(topLeft.x, bottomRight.x)
        const y = Math.min(topLeft.y, bottomRight.y)
        const width = Math.abs(bottomRight.x - topLeft.x)
        const height = Math.abs(bottomRight.y - topLeft.y)
        if (width <= 0 || height <= 0) return ''
        return `<image href="${tile.dataUrl}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="none"/>`
      }).filter(Boolean).join('\n')
      return `
            <rect width="1000" height="1000" fill="#E8F4F8"/>
            <g class="map-tiles">
              ${tilesLayers}
            </g>`
    } else {
      // Fallback satellite background
      const lonSpan = bbox.maxLon - bbox.minLon
      const latSpan = bbox.maxLat - bbox.minLat
      const maxSpan = Math.max(lonSpan, latSpan)
      
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
      
      const latRad = centerLat * Math.PI / 180
      const n = Math.pow(2, zoom)
      const xTile = Math.floor((centerLon + 180) / 360 * n)
      const yTile = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
      
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
  }
}



