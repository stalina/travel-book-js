import { Trip, Step } from '../../models/types'
import { escapeForCssUrlSingleQuotes, esc } from './utils'

/**
 * Helper pour convertir un File en data URL
 */
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

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
 * Calcule la bounding box englobant toutes les étapes
 */
export function calculateBoundingBox(steps: Step[]): BBox | null {
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

/**
 * Calcule le viewBox SVG avec padding
 */
export function calculateViewBox(bbox: BBox, padding: number = 0.1): ViewBox {
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
 * Convertit des coordonnées lat/lon en coordonnées SVG (0-1000)
 */
export function latLonToSvg(lat: number, lon: number, viewBox: ViewBox): SvgCoord {
  // SVG Y axis goes down, lat goes up → invert Y
  const x = ((lon - viewBox.x) / viewBox.width) * 1000
  const y = ((viewBox.y + viewBox.height - lat) / viewBox.height) * 1000
  return { x, y }
}

/**
 * Génère le path SVG (commandes M/L) pour le tracé de l'itinéraire
 */
export function generatePathData(steps: Step[], viewBox: ViewBox): string {
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

/**
 * Génère les vignettes SVG (foreignObject) pour chaque étape
 */
export function generateStepMarkers(
  steps: Step[], 
  viewBox: ViewBox,
  photosMapping: Record<number, Record<number, any>>,
  photoDataUrlMap: Record<string, string>
): string {
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

/**
 * Génère un fond satellite stylisé (fallback)
 */
export function generateSatelliteBackground(bbox: BBox): string {
  // Calcul du niveau de zoom approximatif
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

/**
 * Récupère les tuiles satellite pour la bounding box et retourne les data URLs + viewBox ajusté
 */
export async function fetchTilesForBbox(bbox: BBox): Promise<{
  tiles: Array<{ dataUrl: string, bounds: { north: number, south: number, west: number, east: number } }>,
  adjustedViewBox: ViewBox
}> {
  const clampLat = (lat: number) => Math.max(-85, Math.min(85, lat))
  const clampLon = (lon: number) => Math.max(-180, Math.min(180, lon))

  const rawLatSpan = Math.max(1e-6, bbox.maxLat - bbox.minLat)
  const rawLonSpan = Math.max(1e-6, bbox.maxLon - bbox.minLon)
  const maxSpan = Math.max(rawLatSpan, rawLonSpan)

  // Utilise un padding généreux pour garantir que tous les points restent visibles
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

  // eslint-disable-next-line no-console
  console.log('[TB][generate][map][tiles:fetching]', { zoom, tilesX, tilesY, range: { minX, maxX, minY, maxY }, paddedBBox })

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
            // eslint-disable-next-line no-console
            console.log('[TB][generate][map][tiles:fetched]', { x: tx, y: ty, zoom })
          })
          .catch(err => {
            // eslint-disable-next-line no-console
            console.warn('[TB][generate][map][tiles:fetch failed]', { x: tx, y: ty, zoom, err })
          })
      )
    }
  }

  await Promise.all(promises)

  if (!tileImages.length) {
    // eslint-disable-next-line no-console
    console.warn('[TB][generate][map][tiles:no tiles fetched, using fallback]')
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

  // eslint-disable-next-line no-console
  console.log('[TB][generate][map][tiles:adjustedViewBox]', adjustedViewBox)

  return { tiles: tileImages, adjustedViewBox }
}

export type MapBuilderContext = {
  trip: Trip
  photosMapping: Record<number, Record<number, any>>
  photoDataUrlMap: Record<string, string>
}

/**
 * Construit la page carte du voyage
 * @param context - Contexte contenant le voyage, le mapping des photos et leurs data URLs
 * @returns HTML de la page carte
 */
export async function buildMapSection(context: MapBuilderContext): Promise<string> {
  try {
    const { trip, photosMapping, photoDataUrlMap } = context
    
    if (!trip.steps.length) return ''
    // eslint-disable-next-line no-console
    console.log('[TB][generate][map:building section]')

    const bbox = calculateBoundingBox(trip.steps)
    if (!bbox) return ''

    const { tiles, adjustedViewBox: viewBox } = await fetchTilesForBbox(bbox)
    // eslint-disable-next-line no-console
    console.log('[TB][generate][map:tiles fetched]', { tiles: tiles.length })

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
    // eslint-disable-next-line no-console
    console.log('[TB][generate][map:path generated]', { length: pathData.length, steps: trip.steps.length })

    // Génération des vignettes d'étapes avec le viewBox ajusté
    const markers = generateStepMarkers(trip.steps, viewBox, photosMapping, photoDataUrlMap)
    // eslint-disable-next-line no-console
    console.log('[TB][generate][map:markers generated]', { count: trip.steps.length })

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
    // eslint-disable-next-line no-console
    console.warn('[TB][generate][map:build error]', e)
    return ''
  }
}
