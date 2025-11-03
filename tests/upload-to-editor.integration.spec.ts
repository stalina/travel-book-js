import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTripStore } from '../src/stores/trip.store'
import { useEditorStore } from '../src/stores/editor.store'
import { TripParser } from '../src/services/parse.service'
import { FileSystemService, type FFInput } from '../src/services/fs.service'

describe('Intégration Upload → TripStore → EditorStore', () => {
  let tripStore: ReturnType<typeof useTripStore>
  let editorStore: ReturnType<typeof useEditorStore>
  let mockFileSystemService: FileSystemService
  let tripParser: TripParser

  const mockTripJson = {
    id: 1,
    name: 'Voyage de Test',
    start_date: 1609459200,
    end_date: 1612051200,
    summary: 'Un voyage test',
    cover_photo: { path: 'cover.jpg' },
    all_steps: [
      {
        id: 10,
        display_name: 'Paris',
        description: 'Capitale',
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
      }
    ]
  }

  // Helper pour créer une FileList
  function createFileList(files: File[]): FileList {
    const dataTransfer = new DataTransfer()
    files.forEach(file => dataTransfer.items.add(file))
    return dataTransfer.files
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    tripStore = useTripStore()
    editorStore = useEditorStore()
    
    mockFileSystemService = FileSystemService.getInstance()
    tripParser = TripParser.getInstance()
    
    vi.clearAllMocks()
  })

  it('charge le Trip depuis le parser vers le tripStore', async () => {
    // Arrange
    const mockFile = new File([JSON.stringify(mockTripJson)], 'trip.json', { type: 'application/json' })
    const fileList = createFileList([mockFile])
    vi.spyOn(mockFileSystemService, 'readFileFromPath').mockResolvedValue(mockFile)
    vi.spyOn(mockFileSystemService, 'readAllPhotos').mockResolvedValue([])

    tripStore.setFiles(fileList)

    // Act
    await tripStore.parseAndMap()

    // Assert
    expect(tripStore.parsedTrip).toBeDefined()
    expect(tripStore.parsedTrip?.name).toBe('Voyage de Test')
    expect(tripStore.parsedTrip?.steps).toHaveLength(1)
    expect(tripStore.hasParsedTrip).toBe(true)
  })

  it('passe le Trip du tripStore à l\'editorStore', async () => {
    // Arrange
    const mockFile = new File([JSON.stringify(mockTripJson)], 'trip.json', { type: 'application/json' })
    const fileList = createFileList([mockFile])
    vi.spyOn(mockFileSystemService, 'readFileFromPath').mockResolvedValue(mockFile)
    vi.spyOn(mockFileSystemService, 'readAllPhotos').mockResolvedValue([])

    tripStore.setFiles(fileList)

    // Act
    await tripStore.parseAndMap()
    const trip = tripStore.parsedTrip

    if (trip) {
      editorStore.setTrip(trip)
    }

    // Assert
    expect(editorStore.currentTrip).toBeDefined()
    expect(editorStore.currentTrip?.name).toBe('Voyage de Test')
    expect(editorStore.currentTrip?.steps).toHaveLength(1)
    expect(editorStore.currentStep?.name).toBe('Paris')
  })

  it('flux complet: upload → parse → edit', async () => {
    // Arrange
    const mockFile = new File([JSON.stringify(mockTripJson)], 'trip.json', { type: 'application/json' })
    const fileList = createFileList([mockFile])
    vi.spyOn(mockFileSystemService, 'readFileFromPath').mockResolvedValue(mockFile)
    vi.spyOn(mockFileSystemService, 'readAllPhotos').mockResolvedValue([])

    // Act - Simule le flux HomeView.goGenerate()
    tripStore.setFiles(fileList)
    await tripStore.parseAndMap()
    
    const trip = tripStore.parsedTrip
    if (trip) {
      editorStore.setTrip(trip)
    }

    // Assert - Vérifie que l'éditeur a le Trip
    expect(editorStore.currentTrip).toBeDefined()
    expect(editorStore.currentTrip?.name).toBe('Voyage de Test')
    expect(editorStore.currentStep).toBeDefined()
    
    // Act - Change d'étape (test navigation)
    editorStore.setCurrentStep(0)

    // Assert - Vérifie que l'étape est toujours accessible
    expect(editorStore.currentStep?.name).toBe('Paris')
  })

  it('gère le cas où le parsing échoue', async () => {
    // Arrange
    vi.spyOn(mockFileSystemService, 'readFileFromPath').mockResolvedValue(null)

    const mockFile = new File([''], 'trip.json', { type: 'application/json' })
    const fileList = createFileList([mockFile])
    tripStore.setFiles(fileList)

    // Act & Assert
    await expect(tripStore.parseAndMap()).rejects.toThrow('trip.json introuvable')
    expect(tripStore.parsedTrip).toBeNull()
    expect(tripStore.hasParsedTrip).toBe(false)
  })

  it('gère le cas où le Trip n\'est pas disponible pour l\'éditeur', async () => {
    // Arrange - Pas de parsing

    // Act
    const trip = tripStore.parsedTrip

    // Assert
    expect(trip).toBeNull()
    expect(editorStore.currentTrip).toBeNull()
    expect(editorStore.currentStep).toBeNull()
  })
})
