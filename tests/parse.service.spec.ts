import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TripParser } from '../src/services/parse.service'
import { FileSystemService, type FFInput } from '../src/services/fs.service'
import type { Trip } from '../src/models/types'

describe('parse.service - TripParser', () => {
  let mockFileSystemService: FileSystemService
  let tripParser: TripParser

  const mockTripJson = {
    id: 1,
    name: 'Mon Voyage',
    start_date: 1609459200,
    end_date: 1612051200,
    summary: 'Un super voyage',
    cover_photo: { path: 'cover.jpg' },
    all_steps: [
      {
        id: 10,
        display_name: 'Paris',
        description: 'Capitale de France',
        slug: 'paris',
        location: {
          name: 'Paris',
          detail: 'France',
          country_code: 'FR',
          lat: 48.8566,
          lon: 2.3522
        },
        weather_condition: 'sunny',
        weather_temperature: 20,
        start_time: 1609459200
      },
      {
        id: 20,
        display_name: 'Lyon',
        description: 'Deuxième ville',
        slug: 'lyon',
        location: {
          name: 'Lyon',
          detail: 'France',
          country_code: 'FR',
          lat: 45.75,
          lon: 4.85
        },
        weather_condition: 'cloudy',
        weather_temperature: 18,
        start_time: 1610064000
      }
    ]
  }

  beforeEach(() => {
    // Mock FileSystemService
    mockFileSystemService = {
      readFileFromPath: vi.fn(),
      readAllPhotos: vi.fn()
    } as any

    // Create TripParser with mocked FileSystemService
    tripParser = (TripParser as any).instance = new (TripParser as any)(mockFileSystemService)
    
    // Clear window.__parsedTrip
    ;(window as any).__parsedTrip = undefined
  })

  it('parse un voyage avec succès', async () => {
    const mockFile = new File([JSON.stringify(mockTripJson)], 'trip.json', { type: 'application/json' })
    vi.mocked(mockFileSystemService.readFileFromPath).mockResolvedValue(mockFile)
    vi.mocked(mockFileSystemService.readAllPhotos).mockResolvedValue([])

    const input: FFInput = { kind: 'files', files: [mockFile] }

    await tripParser.parse(input)

    expect(mockFileSystemService.readFileFromPath).toHaveBeenCalledWith(input, ['trip.json'])
    expect((window as any).__parsedTrip).toBeDefined()
    expect((window as any).__parsedTrip.trip.name).toBe('Mon Voyage')
    expect((window as any).__parsedTrip.trip.steps).toHaveLength(2)
  })

  it('mappe correctement les étapes depuis le JSON', async () => {
    const mockFile = new File([JSON.stringify(mockTripJson)], 'trip.json', { type: 'application/json' })
    vi.mocked(mockFileSystemService.readFileFromPath).mockResolvedValue(mockFile)
    vi.mocked(mockFileSystemService.readAllPhotos).mockResolvedValue([])

    const input: FFInput = { kind: 'files', files: [mockFile] }

    await tripParser.parse(input)

    const trip = (window as any).__parsedTrip.trip as Trip
    expect(trip.steps[0]).toMatchObject({
      id: 10,
      name: 'Paris',
      description: 'Capitale de France',
      city: 'Paris',
      country: 'France',
      country_code: 'FR',
      lat: 48.8566,
      lon: 2.3522
    })
  })

  it('charge les photos pour chaque étape', async () => {
    const mockFile = new File([JSON.stringify(mockTripJson)], 'trip.json', { type: 'application/json' })
    const mockPhoto1 = new File(['photo1'], 'photo1.jpg', { type: 'image/jpeg' })
    const mockPhoto2 = new File(['photo2'], 'photo2.jpg', { type: 'image/jpeg' })

    vi.mocked(mockFileSystemService.readFileFromPath).mockResolvedValue(mockFile)
    vi.mocked(mockFileSystemService.readAllPhotos)
      .mockResolvedValueOnce([mockPhoto1])
      .mockResolvedValueOnce([mockPhoto2])

    const input: FFInput = { kind: 'files', files: [mockFile] }

    await tripParser.parse(input)

    expect(mockFileSystemService.readAllPhotos).toHaveBeenCalledTimes(2)
    expect(mockFileSystemService.readAllPhotos).toHaveBeenCalledWith(input, 'paris', 10)
    expect(mockFileSystemService.readAllPhotos).toHaveBeenCalledWith(input, 'lyon', 20)

    const stepPhotos = (window as any).__parsedTrip.stepPhotos
    expect(stepPhotos[10]).toEqual([mockPhoto1])
    expect(stepPhotos[20]).toEqual([mockPhoto2])
  })

  it('gère le cas où trip.json est introuvable', async () => {
    vi.mocked(mockFileSystemService.readFileFromPath).mockResolvedValue(null)

    const input: FFInput = { kind: 'files', files: [] }

    await expect(tripParser.parse(input)).rejects.toThrow('trip.json introuvable')
  })

  it('gère le cas où end_date est null', async () => {
    const tripJsonNoEndDate = { ...mockTripJson, end_date: null }
    const mockFile = new File([JSON.stringify(tripJsonNoEndDate)], 'trip.json', { type: 'application/json' })
    
    vi.mocked(mockFileSystemService.readFileFromPath).mockResolvedValue(mockFile)
    vi.mocked(mockFileSystemService.readAllPhotos).mockResolvedValue([])

    const input: FFInput = { kind: 'files', files: [mockFile] }

    await tripParser.parse(input)

    const trip = (window as any).__parsedTrip.trip as Trip
    expect(trip.end_date).toBeNull()
  })

  it('gère le cas où location.name est absent (city undefined)', async () => {
    const tripJsonNoCity = {
      ...mockTripJson,
      all_steps: [{
        ...mockTripJson.all_steps[0],
        location: {
          detail: 'France',
          country_code: 'FR',
          lat: 48.8566,
          lon: 2.3522
        }
      }]
    }
    const mockFile = new File([JSON.stringify(tripJsonNoCity)], 'trip.json', { type: 'application/json' })
    
    vi.mocked(mockFileSystemService.readFileFromPath).mockResolvedValue(mockFile)
    vi.mocked(mockFileSystemService.readAllPhotos).mockResolvedValue([])

    const input: FFInput = { kind: 'files', files: [mockFile] }

    await tripParser.parse(input)

    const trip = (window as any).__parsedTrip.trip as Trip
    expect(trip.steps[0].city).toBeUndefined()
  })

  it('stocke les résultats dans window.__parsedTrip', async () => {
    const mockFile = new File([JSON.stringify(mockTripJson)], 'trip.json', { type: 'application/json' })
    vi.mocked(mockFileSystemService.readFileFromPath).mockResolvedValue(mockFile)
    vi.mocked(mockFileSystemService.readAllPhotos).mockResolvedValue([])

    const input: FFInput = { kind: 'files', files: [mockFile] }

    await tripParser.parse(input)

    expect((window as any).__parsedTrip).toBeDefined()
    expect((window as any).__parsedTrip.trip).toBeDefined()
    expect((window as any).__parsedTrip.stepPhotos).toBeDefined()
  })

  it('retourne le Trip parsé', async () => {
    const mockFile = new File([JSON.stringify(mockTripJson)], 'trip.json', { type: 'application/json' })
    vi.mocked(mockFileSystemService.readFileFromPath).mockResolvedValue(mockFile)
    vi.mocked(mockFileSystemService.readAllPhotos).mockResolvedValue([])

    const input: FFInput = { kind: 'files', files: [mockFile] }

    const trip = await tripParser.parse(input)

    expect(trip).toBeDefined()
    expect(trip.name).toBe('Mon Voyage')
    expect(trip.steps).toHaveLength(2)
    expect(trip.steps[0].name).toBe('Paris')
    expect(trip.steps[1].name).toBe('Lyon')
  })

  it('utilise le singleton getInstance()', () => {
    const instance1 = TripParser.getInstance()
    const instance2 = TripParser.getInstance()

    expect(instance1).toBe(instance2)
  })
})
