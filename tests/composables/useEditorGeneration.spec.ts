import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTripStore } from '../../src/stores/trip.store'
import { useEditorStore } from '../../src/stores/editor.store'
import { useEditorGeneration } from '../../src/composables/useEditorGeneration'

// We will stub artifactGenerator.generate to simulate a slow generation and assert lock behavior
vi.mock('../../src/services/generate.service', () => {
  return {
    artifactGenerator: {
      buildSingleFileHtmlString: async (a: any) => '<html></html>'
    }
  }
})

describe('useEditorGeneration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('prevents concurrent preview generations', async () => {
    const tripStore = useTripStore()
    const editorStore = useEditorStore()
    // Create a fake input so generateArtifacts doesn't throw
    tripStore.input = { kind: 'files', files: [] }

    // Mock tripStore.generateArtifacts to simulate a delayed generation and count calls
    let callCount = 0
    vi.spyOn(tripStore, 'generateArtifacts').mockImplementation(async () => {
      callCount++
      // Simulate delay
      await new Promise((r) => setTimeout(r, 50))
      // Provide a minimal artifacts object expected by the generator
      const artifacts = { manifest: {}, files: [], manifestEntries: 0 } as any
      tripStore.artifacts = artifacts
      return artifacts
    })

    const { previewTravelBook } = useEditorGeneration()

    // Fire two preview calls in parallel
    const p1 = previewTravelBook()
    const p2 = previewTravelBook()

    const results = await Promise.all([p1, p2])

    // One of them should have executed generation, the other returned null due to lock
    expect(callCount).toBe(1)
    expect(results.filter(r => r !== null).length).toBe(1)
  })
})
