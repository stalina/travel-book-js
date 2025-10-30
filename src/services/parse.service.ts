import { FFInput, fileSystemService, FileSystemService } from './fs.service'
import { Trip } from '../models/types'
import { loggerService } from './logger.service'

/**
 * TripParser - Orchestrateur responsable du parsing des données de voyage
 * 
 * Charge trip.json, construit l'objet Trip et charge les photos des étapes.
 * Utilise FileSystemService pour l'accès aux fichiers.
 */
export class TripParser {
  private constructor(private readonly fileSystemService: FileSystemService) {}

  /**
   * Parse les données du voyage à partir de l'entrée (FileList ou répertoire)
   * 
   * @param input - Source de données (FileList ou DirectoryHandle)
   * @returns Promise<void> - Stocke le résultat dans window.__parsedTrip
   */
  public async parse(input: FFInput): Promise<void> {
    try {
      loggerService.debug('trip-parser', 'Début du parsing')
      
      const tripJson = await this.loadTripJson(input)
      const trip = this.mapToTrip(tripJson)
      const stepPhotos = await this.loadStepPhotos(input, trip)
      
      this.saveToWindow(trip, stepPhotos)
      
      loggerService.debug('trip-parser', `Parsing terminé: ${trip.steps.length} étapes`)
    } catch (error) {
      loggerService.error('trip-parser', 'Erreur lors du parsing', error)
      throw error
    }
  }

  /**
   * Charge et parse trip.json
   */
  private async loadTripJson(input: FFInput): Promise<any> {
    const tripFile = await this.fileSystemService.readFileFromPath(input, ['trip.json'])
    if (!tripFile) {
      throw new Error('trip.json introuvable')
    }
    return JSON.parse(await tripFile.text())
  }

  /**
   * Mappe le JSON brut vers l'objet Trip typé
   */
  private mapToTrip(tripJson: any): Trip {
    const trip: Trip = {
      id: tripJson.id,
      name: tripJson.name,
      start_date: tripJson.start_date,
      end_date: tripJson.end_date ?? null,
      summary: tripJson.summary,
      cover_photo: tripJson.cover_photo,
      steps: []
    }

    for (const s of tripJson.all_steps) {
      trip.steps.push({
        name: s.display_name,
        description: s.description,
        city: s.location?.name || undefined,
        country: s.location.detail,
        country_code: s.location.country_code,
        weather_condition: s.weather_condition,
        weather_temperature: s.weather_temperature,
        start_time: s.start_time,
        lat: s.location.lat,
        lon: s.location.lon,
        slug: s.slug,
        id: s.id
      })
    }

    return trip
  }

  /**
   * Charge toutes les photos pour chaque étape
   */
  private async loadStepPhotos(input: FFInput, trip: Trip): Promise<Record<number, File[]>> {
    const stepPhotos: Record<number, File[]> = {}
    
    for (const step of trip.steps) {
      stepPhotos[step.id] = await this.fileSystemService.readAllPhotos(input, step.slug, step.id)
    }
    
    return stepPhotos
  }

  /**
   * Sauvegarde les résultats dans window.__parsedTrip
   */
  private saveToWindow(trip: Trip, stepPhotos: Record<number, File[]>): void {
    ;(window as any).__parsedTrip = { trip, stepPhotos }
  }

  // Singleton instance
  private static instance: TripParser | null = null

  public static getInstance(): TripParser {
    if (!TripParser.instance) {
      TripParser.instance = new TripParser(fileSystemService)
    }
    return TripParser.instance
  }
}

// Export singleton instance
export const tripParser = TripParser.getInstance()
