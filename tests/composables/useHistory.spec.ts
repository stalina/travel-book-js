import { describe, it, expect, vi } from 'vitest'
import { useHistory } from '../../src/composables/useHistory'

describe('useHistory', () => {
  it('initializes with no undo/redo', () => {
    const onApply = vi.fn()
    const { canUndo, canRedo } = useHistory({
      maxSize: 20,
      initialState: { value: 0 },
      onApply
    })

    expect(canUndo.value).toBe(false)
    expect(canRedo.value).toBe(false)
  })

  it('records an action', () => {
    const onApply = vi.fn()
    const { record, canUndo, undoStack } = useHistory({
      maxSize: 20,
      initialState: { value: 0 },
      onApply
    })

    const before = { value: 0 }
    const after = { value: 1 }
    record(before, after, 'Increment')

    expect(canUndo.value).toBe(true)
    expect(undoStack.value.length).toBe(1)
    expect(undoStack.value[0].description).toBe('Increment')
  })

  it('undoes an action', () => {
    const onApply = vi.fn()
    const { record, undo, canUndo } = useHistory({
      maxSize: 20,
      initialState: { value: 0 },
      onApply
    })

    record({ value: 0 }, { value: 1 })
    
    expect(canUndo.value).toBe(true)
    undo()
    
    expect(onApply).toHaveBeenCalledWith({ value: 0 })
  })

  it('redoes an action', () => {
    const onApply = vi.fn()
    const { record, undo, redo, canRedo } = useHistory({
      maxSize: 20,
      initialState: { value: 0 },
      onApply
    })

    record({ value: 0 }, { value: 1 })
    undo()
    
    expect(canRedo.value).toBe(true)
    redo()
    
    expect(onApply).toHaveBeenCalledWith({ value: 1 })
  })

  it('limits stack size', () => {
    const onApply = vi.fn()
    const { record, undoStack } = useHistory({
      maxSize: 3,
      initialState: { value: 0 },
      onApply
    })

    for (let i = 0; i < 5; i++) {
      record({ value: i }, { value: i + 1 })
    }

    expect(undoStack.value.length).toBe(3)
  })

  it('clears redo stack when recording new action', () => {
    const onApply = vi.fn()
    const { record, undo, redoStack } = useHistory({
      maxSize: 20,
      initialState: { value: 0 },
      onApply
    })

    record({ value: 0 }, { value: 1 })
    undo()
    expect(redoStack.value.length).toBe(1)

    record({ value: 0 }, { value: 2 })
    expect(redoStack.value.length).toBe(0)
  })

  it('clears all history', () => {
    const onApply = vi.fn()
    const { record, clear, undoStack, redoStack, canUndo } = useHistory({
      maxSize: 20,
      initialState: { value: 0 },
      onApply
    })

    record({ value: 0 }, { value: 1 })
    clear()

    expect(undoStack.value.length).toBe(0)
    expect(redoStack.value.length).toBe(0)
    expect(canUndo.value).toBe(false)
  })
})
