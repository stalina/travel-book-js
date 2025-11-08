import { loggerService } from './logger.service'
import type {
  CropSettings,
  GalleryInitializationPayload,
  GalleryPhoto,
  PhotoAdjustments,
  PhotoFilterPreset,
  PhotoOrientation,
  PhotoQualityInsight
} from '../models/gallery.types'

interface ImageAnalysisResult {
  width: number
  height: number
  orientation: PhotoOrientation
  aiScore: number
  insights: PhotoQualityInsight[]
  palette: string[]
  averageLuminance: number
}

const DEFAULT_ADJUSTMENTS: PhotoAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0
}

const DEFAULT_CROP: CropSettings = {
  ratio: 'original',
  zoom: 1,
  offsetX: 0,
  offsetY: 0
}

/**
 * PhotoMetadataService - Analyse les fichiers photos pour construire les données de la galerie
 */
export class PhotoMetadataService {
  private static instance: PhotoMetadataService | null = null

  private constructor(private readonly logger = loggerService) {}

  public static getInstance(): PhotoMetadataService {
    if (!PhotoMetadataService.instance) {
      PhotoMetadataService.instance = new PhotoMetadataService()
    }
    return PhotoMetadataService.instance
  }

  /**
   * Construit la liste des photos à partir du Trip parsé et des fichiers par étape
   */
  public async buildGalleryPhotos(payload: GalleryInitializationPayload): Promise<GalleryPhoto[]> {
    const { trip, stepPhotos } = payload
    const photos: GalleryPhoto[] = []

    for (const step of trip.steps) {
      const files = stepPhotos[step.id] || []

      for (const file of files) {
        const id = `${step.id}-${file.name}`
        try {
          const bitmap = await this.loadBitmap(file)
          const analysis = await this.analyzeFile(file, bitmap)
          const objectUrl = URL.createObjectURL(file)

          const locationParts = [step.city, step.country].filter(Boolean)
          const tags = this.buildTags(step.name, locationParts, step.country_code, analysis.orientation, file)

          photos.push({
            id,
            stepId: step.id,
            stepName: step.name,
            stepDate: step.start_time,
            location: locationParts.join(' · ') || step.name,
            countryCode: step.country_code,
            tags,
            file,
            objectUrl,
            width: analysis.width,
            height: analysis.height,
            orientation: analysis.orientation,
            fileSize: file.size,
            filterPreset: 'original',
            adjustments: { ...DEFAULT_ADJUSTMENTS },
            crop: { ...DEFAULT_CROP },
            rotation: 0,
            aiFavoriteScore: analysis.aiScore,
            aiFavorite: analysis.aiScore >= 0.65,
            customFavorite: false,
            hidden: false,
            qualityInsights: analysis.insights,
            palette: analysis.palette
          })

          this.releaseBitmap(bitmap)
        } catch (error) {
          this.logger.warn('photo-metadata', `Analyse impossible pour ${file.name}`, error)
        }
      }
    }

    photos.sort((a, b) => b.stepDate - a.stepDate)
    return photos
  }

  /**
   * Libère les object URLs associés
   */
  public cleanup(photos: GalleryPhoto[]): void {
    for (const photo of photos) {
      URL.revokeObjectURL(photo.objectUrl)
    }
  }

  private buildTags(
    stepName: string,
    locationParts: string[],
    countryCode: string,
    orientation: PhotoOrientation,
    file: File
  ): string[] {
    const tags = new Set<string>()
    const baseName = stepName.toLowerCase()
    tags.add(`step:${baseName}`)

    for (const part of locationParts) {
      tags.add(`lieu:${part.toLowerCase()}`)
    }

    tags.add(`pays:${countryCode.toLowerCase()}`)
    tags.add(`orientation:${orientation}`)

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    tags.add(`format:${ext}`)

    if (/sun|soleil|beau/i.test(stepName)) {
      tags.add('ambiance:ensoleillee')
    }
    if (/nuit|soir|night/i.test(stepName)) {
      tags.add('ambiance:nuit')
    }
    if (/pluie|rain/i.test(stepName)) {
      tags.add('meteo:pluie')
    }

    return Array.from(tags)
  }

  private async analyzeFile(
    file: File,
    bitmap: ImageBitmap | HTMLImageElement | null
  ): Promise<ImageAnalysisResult> {
    const width = bitmap?.width ?? 1920
    const height = bitmap?.height ?? 1080
    const orientation: PhotoOrientation = width === height ? 'square' : width > height ? 'landscape' : 'portrait'

    const megapixels = (width * height) / 1_000_000
    const aiScoreBase = Math.min(1, megapixels / 4)
    const insights: PhotoQualityInsight[] = []

    if (megapixels < 1) {
      insights.push({
        type: 'low-resolution',
        message: 'Résolution faible détectée (< 1 MP).'
      })
    }

    const compressionRatio = file.size / (width * height)
    if (compressionRatio < 0.35) {
      insights.push({
        type: 'potential-blur',
        message: 'Compression importante détectée, risque de flou.'
      })
    }

    const luminance = await this.computeAverageLuminance(bitmap)
    if (luminance < 35) {
      insights.push({
        type: 'under-exposed',
        message: 'Photo sombre détectée.'
      })
    }
    if (luminance > 220) {
      insights.push({
        type: 'over-exposed',
        message: 'Photo potentiellement surexposée.'
      })
    }

    const palette = await this.extractPalette(bitmap)
    const aiScore = Math.min(1, aiScoreBase + (orientation === 'landscape' ? 0.1 : 0) - insights.length * 0.1)

    return {
      width,
      height,
      orientation,
      aiScore: Math.max(0, aiScore),
      insights,
      palette,
      averageLuminance: luminance
    }
  }

  private async loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement | null> {
    if (typeof window === 'undefined') {
      return null
    }

    if ('createImageBitmap' in window) {
      try {
        return await createImageBitmap(file)
      } catch (error) {
        this.logger.warn('photo-metadata', 'createImageBitmap a échoué, fallback image classique', error)
      }
    }

    if (typeof document === 'undefined') {
      return null
    }

    return await new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = () => {
        img.onload = () => {
          resolve(img)
        }
        img.onerror = reject
        img.src = reader.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  private async computeAverageLuminance(bitmap: ImageBitmap | HTMLImageElement | null): Promise<number> {
    if (!bitmap || typeof document === 'undefined') {
      return 128
    }

    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return 128
    }

    ctx.drawImage(bitmap as CanvasImageSource, 0, 0, 64, 64)
    const imageData = ctx.getImageData(0, 0, 64, 64)
    let total = 0
    const { data } = imageData

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      total += 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    return total / (data.length / 4)
  }

  private async extractPalette(bitmap: ImageBitmap | HTMLImageElement | null): Promise<string[]> {
    if (!bitmap || typeof document === 'undefined') {
      return ['#cccccc', '#888888', '#333333']
    }

    const canvas = document.createElement('canvas')
    canvas.width = 24
    canvas.height = 24
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return ['#cccccc', '#888888', '#333333']
    }

    ctx.drawImage(bitmap as CanvasImageSource, 0, 0, 24, 24)
    const data = ctx.getImageData(0, 0, 24, 24).data
    const buckets = new Map<number, number>()

    for (let i = 0; i < data.length; i += 12) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const key = (r << 16) | (g << 8) | b
      buckets.set(key, (buckets.get(key) ?? 0) + 1)
    }

    const topColors = Array.from(buckets.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key]) => `#${key.toString(16).padStart(6, '0')}`)

    while (topColors.length < 3) {
      topColors.push('#cccccc')
    }

    return topColors
  }

  private releaseBitmap(bitmap: ImageBitmap | HTMLImageElement | null): void {
    if (!bitmap) {
      return
    }

    if ('close' in bitmap && typeof (bitmap as ImageBitmap).close === 'function') {
      try {
        (bitmap as ImageBitmap).close()
      } catch (error) {
        this.logger.warn('photo-metadata', 'Impossible de libérer l\'ImageBitmap', error)
      }
    }
  }
}

export const photoMetadataService = PhotoMetadataService.getInstance()
