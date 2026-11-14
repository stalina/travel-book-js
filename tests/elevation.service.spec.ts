import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ElevationService, ELEVATION_API_URL } from '../src/services/elevation.service'
import { loggerService } from '../src/services/logger.service'

const freshService = (): ElevationService => {
  ;(ElevationService as any).instance = undefined
  return ElevationService.getInstance()
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('ElevationService', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('interroge Open-Meteo (compatible CORS) et non un proxy de dev', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ elevation: [154, 658] }))
    const service = freshService()

    const result = await service.getElevationsBulk([
      { lat: 48.64, lon: 1.83 },
      { lat: 43.2, lon: -1.5 }
    ])

    expect(result).toEqual([154, 658])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const url = String(fetchMock.mock.calls[0][0])
    expect(url.startsWith(`${ELEVATION_API_URL}?`)).toBe(true)
    expect(url).toContain('latitude=48.640000,43.200000')
    expect(url).toContain('longitude=1.830000,-1.500000')
  })

  it('met en cache les altitudes récupérées', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ elevation: [100] }))
    const service = freshService()

    await service.getElevationsBulk([{ lat: 1, lon: 2 }])
    const cached = await service.getElevation(1, 2)

    expect(cached).toBe(100)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('résout les demandes unitaires via la file d\'attente', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ elevation: [1234] }))
    const service = freshService()

    await expect(service.getElevation(42.5, 0.5)).resolves.toBe(1234)
  })

  it('renvoie null et n\'avertit qu\'une seule fois quand l\'API échoue', async () => {
    fetchMock.mockResolvedValue(new Response('not found', { status: 404 }))
    const warn = vi.spyOn(loggerService, 'warn').mockImplementation(() => {})
    const service = freshService()

    const bulk = await service.getElevationsBulk([{ lat: 10, lon: 10 }])
    const single = await service.getElevation(11, 11)
    const other = await service.getElevation(12, 12)

    expect(bulk).toEqual([null])
    expect(single).toBeNull()
    expect(other).toBeNull()
    expect(warn).toHaveBeenCalledTimes(1)
  })
})
