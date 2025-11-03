import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAutoSave, type SaveStatus } from '../../src/composables/useAutoSave'

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('initializes with idle status', () => {
    const onSave = vi.fn()
    const { status } = useAutoSave({ onSave })

    expect(status.value).toBe('idle')
  })

  it('triggers save after debounce delay', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { triggerSave, status } = useAutoSave({
      debounceMs: 1000,
      onSave
    })

    triggerSave()
    expect(status.value).toBe('pending')

    // Avancer les timers
    await vi.advanceTimersByTimeAsync(1000)

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(status.value).toBe('saved')
  })

  it('cancels previous save when triggering again', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { triggerSave } = useAutoSave({
      debounceMs: 1000,
      onSave
    })

    triggerSave()
    vi.advanceTimersByTime(500)
    triggerSave() // Annule le premier

    vi.advanceTimersByTime(1000)
    await vi.runAllTimersAsync()

    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('saves immediately with saveNow', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { saveNow, status } = useAutoSave({ onSave })

    await saveNow()

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(status.value).toBe('saved')
  })

  it('handles save errors', async () => {
    const error = new Error('Save failed')
    const onSave = vi.fn().mockRejectedValue(error)
    const onError = vi.fn()
    
    const { saveNow, status } = useAutoSave({
      onSave,
      onError
    })

    await saveNow()

    expect(status.value).toBe('error')
    expect(onError).toHaveBeenCalledWith(error)
  })

  it('resets status after saved', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { saveNow, status } = useAutoSave({ onSave })

    await saveNow()
    expect(status.value).toBe('saved')

    vi.advanceTimersByTime(2000)

    expect(status.value).toBe('idle')
  })

  it('resets status after error', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Fail'))
    const { saveNow, status } = useAutoSave({ onSave })

    await saveNow()
    expect(status.value).toBe('error')

    vi.advanceTimersByTime(3000)

    expect(status.value).toBe('idle')
  })

  it('resets everything with reset()', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { triggerSave, reset, status } = useAutoSave({ onSave })

    triggerSave()
    reset()

    expect(status.value).toBe('idle')
    
    vi.advanceTimersByTime(1000)
    await vi.runAllTimersAsync()

    expect(onSave).not.toHaveBeenCalled()
  })
})
