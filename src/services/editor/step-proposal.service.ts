import type { Trip, Step } from '../../models/types'
import type {
  EditorStepPhoto,
  StepProposal,
  StepProposalPhoto,
  StepProposalStatsEntry
} from '../../models/editor.types'

/**
 * StepProposalService - génère des propositions automatiques pour une étape
 *
 * Produit un résumé, une description enrichie, des statistiques clefs et une 
 * sélection de photos recommandée à partir des données brutes du voyage.
 */
export class StepProposalService {
  private static instance: StepProposalService | null = null

  private constructor() {}

  public static getInstance(): StepProposalService {
    if (!StepProposalService.instance) {
      StepProposalService.instance = new StepProposalService()
    }
    return StepProposalService.instance
  }

  /**
   * Génère une proposition automatique pour une étape donnée.
   *
   * @param trip - Voyage complet pour calculer la progression et la durée
   * @param step - Étape ciblée
   * @param photos - Photos préparées (URL d'aperçu, ratio, index)
   */
  public generate(trip: Trip, step: Step, photos: EditorStepPhoto[]): StepProposal {
    const dayNumber = this.computeDayNumber(trip, step)
    const location = this.buildLocation(step)
    const weather = this.buildWeatherSummary(step)

    const summary = `Jour ${dayNumber} · ${location}`
    const description = this.buildDescription(step, location, weather, dayNumber)
    const stats = this.buildStats(step, dayNumber, trip)

    const coverPhoto = this.pickCoverPhoto(photos)
    const recommendedPhotos = this.buildRecommendedPhotos(photos, coverPhoto?.index ?? null)

    return {
      stepId: step.id,
      summary,
      description,
      generatedAt: Date.now(),
      stats,
      coverPhotoIndex: coverPhoto?.index ?? null,
      photos: recommendedPhotos
    }
  }

  private computeDayNumber(trip: Trip, step: Step): number {
    const tripStart = new Date(trip.start_date * 1000)
    const stepDate = new Date(step.start_time * 1000)
    const diff = stepDate.getTime() - tripStart.getTime()
    const msPerDay = 24 * 60 * 60 * 1000
    return Math.max(1, Math.floor(diff / msPerDay) + 1)
  }

  private buildLocation(step: Step): string {
    const parts = [step.city?.trim(), step.country.trim()].filter(Boolean)
    return parts.length ? parts.join(', ') : step.country || 'Localisation inconnue'
  }

  private buildWeatherSummary(step: Step): string {
    const temp = Number.isFinite(step.weather_temperature)
      ? `${step.weather_temperature.toFixed(1)}°C`
      : 'Température inconnue'
    const condition = step.weather_condition?.trim()
    return condition ? `${condition} (${temp})` : temp
  }

  private buildDescription(step: Step, location: string, weather: string, dayNumber: number): string {
    const base = step.description?.trim()
    const intro = `Jour ${dayNumber} à ${location}.`
    const weatherSentence = `Conditions météo : ${weather}.`

    if (base && base.length > 0) {
      return `${intro} ${weatherSentence} ${base}`.trim()
    }

    return `${intro} ${weatherSentence} Ajoutez vos souvenirs et moments forts de cette étape.`
  }

  private buildStats(step: Step, dayNumber: number, trip: Trip): StepProposalStatsEntry[] {
    const totalSteps = trip.steps.length
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long'
    })
    const stepDate = new Date(step.start_time * 1000)

    return [
      { label: 'Jour', value: `${dayNumber} / ${Math.max(1, this.estimateTripDuration(trip))}` },
      { label: 'Étape', value: `${this.computeStepPosition(trip, step)} / ${totalSteps}` },
      { label: 'Météo', value: this.buildWeatherSummary(step) },
      { label: 'Date', value: formatter.format(stepDate) }
    ]
  }

  private estimateTripDuration(trip: Trip): number {
    if (!trip.start_date || !trip.end_date) {
      return Math.max(1, trip.steps.length)
    }
    const start = new Date(trip.start_date * 1000)
    const end = new Date(trip.end_date * 1000)
    const diff = end.getTime() - start.getTime()
    const msPerDay = 24 * 60 * 60 * 1000
    return Math.max(1, Math.ceil(diff / msPerDay))
  }

  private computeStepPosition(trip: Trip, step: Step): number {
    const index = trip.steps.findIndex((s) => s.id === step.id)
    return index >= 0 ? index + 1 : 1
  }

  private pickCoverPhoto(photos: EditorStepPhoto[]): EditorStepPhoto | null {
    if (!photos.length) return null
    const portraits = photos.filter((p) => p.ratio === 'PORTRAIT')
    const landscapes = photos.filter((p) => p.ratio === 'LANDSCAPE')

    return portraits[0] ?? landscapes[0] ?? photos[0]
  }

  private buildRecommendedPhotos(photos: EditorStepPhoto[], coverIndex: number | null): StepProposalPhoto[] {
    const limited = photos.slice(0, Math.min(6, photos.length))
    return limited.map((photo) => ({
      id: photo.id,
      index: photo.index,
      url: photo.url,
      ratio: photo.ratio,
      isCover: coverIndex === photo.index,
      label: photo.name || `Photo ${photo.index}`
    }))
  }
}

export const stepProposalService = StepProposalService.getInstance()
