import { describe, it, expect } from 'vitest'
import { MapBuilder } from '../src/services/builders/map.builder'

const makeTrip = (steps: any[]) => ({ steps })

describe('MapBuilder initialFocus helpers', () => {
  it('zoomToDegreeSpan maps zoom to degree span', () => {
    const mb = new MapBuilder(makeTrip([]) as any, {}, {}, undefined)
    const z14 = (mb as any).zoomToDegreeSpan(14)
    expect(z14).toBeCloseTo(0.02)
    expect((mb as any).zoomToDegreeSpan(10)).toBeCloseTo(0.5)
    expect((mb as any).zoomToDegreeSpan(6)).toBeCloseTo(10)
  })

  it('computeBBoxFromCenterZoom returns bbox centered with span', () => {
    const mb = new MapBuilder(makeTrip([]) as any, {}, {}, undefined)
    const bbox = (mb as any).computeBBoxFromCenterZoom({ lat: 10, lon: 20 }, 12)
    const span = (mb as any).zoomToDegreeSpan(12)
    expect(bbox.minLat).toBeCloseTo(10 - span / 2)
    expect(bbox.maxLat).toBeCloseTo(10 + span / 2)
    expect(bbox.minLon).toBeCloseTo(20 - span / 2)
    expect(bbox.maxLon).toBeCloseTo(20 + span / 2)
  })

  it('computeBBoxFromStepIds returns bbox for given step ids and null if none found', () => {
    const trip = makeTrip([
      { id: 1, lat: 1, lon: 2 },
      { id: 2, lat: 3, lon: 4 },
      { id: 3, lat: -1, lon: 5 }
    ])
    const mb = new MapBuilder(trip as any, {}, {}, undefined)
    const bbox = (mb as any).computeBBoxFromStepIds([1, 2])
    expect(bbox).toEqual({ minLat: 1, maxLat: 3, minLon: 2, maxLon: 4 })
    const none = (mb as any).computeBBoxFromStepIds([999])
    expect(none).toBeNull()
  })
})
