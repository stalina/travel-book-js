export type Trip = {
  id: number
  name: string
  start_date: number
  end_date: number | null
  steps: Step[]
  summary?: string
  cover_photo: Photo | null
}

export type Step = {
  name: string
  description: string | null
  city?: string
  country: string
  country_code: string
  weather_condition: string
  weather_temperature: number
  start_time: number
  lat: number
  lon: number
  slug: string
  id: number
}

export type Photo = {
  id: string
  index: number
  path: string
  ratio: 'PORTRAIT' | 'LANDSCAPE' | 'UNKNOWN'
}
