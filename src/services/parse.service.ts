import { FFInput, readFileFromPath, readAllPhotos } from './fs.service'
import { Trip } from '../models/types'

export async function parseTrip(input: FFInput) {
  // Read trip.json
  const tripFile = await readFileFromPath(input, ['trip.json'])
  if (!tripFile) throw new Error('trip.json introuvable')
  const tripJson: any = JSON.parse(await tripFile.text())

  const trip: Trip = {
    id: tripJson.id,
    name: tripJson.name,
    start_date: tripJson.start_date,
    end_date: tripJson.end_date ?? null,
    summary: tripJson.summary,
    cover_photo: tripJson.cover_photo,
    steps: []
  }

  let i = 1
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
    i++
  }

  // Preload photos per step for mapping indices
  const stepPhotos: Record<number, File[]> = {}
  for (const step of trip.steps) {
    stepPhotos[step.id] = await readAllPhotos(input, step.slug, step.id)
  }

  ;(window as any).__parsedTrip = { trip, stepPhotos }
}
