import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useDragAndDrop } from '../../src/composables/useDragAndDrop'

describe('useDragAndDrop', () => {
  let items: ReturnType<typeof ref<string[]>>
  let onReorder: ReturnType<typeof vi.fn>

  beforeEach(() => {
    items = ref(['Item 1', 'Item 2', 'Item 3', 'Item 4'])
    onReorder = vi.fn()
  })

  it('initializes with correct default state', () => {
    const { draggedIndex, dragOverIndex, isDragging } = useDragAndDrop(items, onReorder)
    
    expect(draggedIndex.value).toBeNull()
    expect(dragOverIndex.value).toBeNull()
    expect(isDragging.value).toBe(false)
  })

  it('handles drag start correctly', () => {
    const { handleDragStart, draggedIndex, isDragging } = useDragAndDrop(items, onReorder)
    
    const mockEvent = {
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn()
      },
      target: document.createElement('div')
    } as unknown as DragEvent
    
    handleDragStart(mockEvent, 1)
    
    expect(draggedIndex.value).toBe(1)
    expect(isDragging.value).toBe(true)
    expect(mockEvent.dataTransfer!.effectAllowed).toBe('move')
    expect(mockEvent.dataTransfer!.setData).toHaveBeenCalledWith('text/html', '1')
  })

  it('handles drag over correctly', () => {
    const { handleDragStart, handleDragOver, dragOverIndex } = useDragAndDrop(items, onReorder)
    
    const startEvent = {
      dataTransfer: { effectAllowed: '', setData: vi.fn() },
      target: document.createElement('div')
    } as unknown as DragEvent
    
    const overEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { dropEffect: '' }
    } as unknown as DragEvent
    
    handleDragStart(startEvent, 0)
    handleDragOver(overEvent, 2)
    
    expect(overEvent.preventDefault).toHaveBeenCalled()
    expect(dragOverIndex.value).toBe(2)
    expect(overEvent.dataTransfer!.dropEffect).toBe('move')
  })

  it('does not update drag over if hovering same item', () => {
    const { handleDragStart, handleDragOver, dragOverIndex } = useDragAndDrop(items, onReorder)
    
    const startEvent = {
      dataTransfer: { effectAllowed: '', setData: vi.fn() },
      target: document.createElement('div')
    } as unknown as DragEvent
    
    const overEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { dropEffect: '' }
    } as unknown as DragEvent
    
    handleDragStart(startEvent, 1)
    handleDragOver(overEvent, 1)
    
    expect(dragOverIndex.value).toBeNull()
  })

  it('handles drop and reorders items', () => {
    const { handleDragStart, handleDrop } = useDragAndDrop(items, onReorder)
    
    const startEvent = {
      dataTransfer: { effectAllowed: '', setData: vi.fn() },
      target: document.createElement('div')
    } as unknown as DragEvent
    
    const dropEvent = {
      preventDefault: vi.fn()
    } as unknown as DragEvent
    
    handleDragStart(startEvent, 0) // Drag Item 1
    handleDrop(dropEvent, 2) // Drop at position 2
    
    expect(dropEvent.preventDefault).toHaveBeenCalled()
    expect(onReorder).toHaveBeenCalledWith(['Item 2', 'Item 3', 'Item 1', 'Item 4'])
  })

  it('does not reorder if dropped on same position', () => {
    const { handleDragStart, handleDrop } = useDragAndDrop(items, onReorder)
    
    const startEvent = {
      dataTransfer: { effectAllowed: '', setData: vi.fn() },
      target: document.createElement('div')
    } as unknown as DragEvent
    
    const dropEvent = {
      preventDefault: vi.fn()
    } as unknown as DragEvent
    
    handleDragStart(startEvent, 1)
    handleDrop(dropEvent, 1)
    
    expect(onReorder).not.toHaveBeenCalled()
  })

  it('handles drag end and resets state', () => {
    const { handleDragStart, handleDragEnd, draggedIndex, isDragging } = useDragAndDrop(items, onReorder)
    
    const startEvent = {
      dataTransfer: { effectAllowed: '', setData: vi.fn() },
      target: document.createElement('div')
    } as unknown as DragEvent
    
    const endEvent = {
      target: document.createElement('div')
    } as unknown as DragEvent
    
    handleDragStart(startEvent, 2)
    expect(draggedIndex.value).toBe(2)
    expect(isDragging.value).toBe(true)
    
    handleDragEnd(endEvent)
    expect(draggedIndex.value).toBeNull()
    expect(isDragging.value).toBe(false)
  })

  it('isItemDragged returns correct value', () => {
    const { handleDragStart, isItemDragged } = useDragAndDrop(items, onReorder)
    
    const mockEvent = {
      dataTransfer: { effectAllowed: '', setData: vi.fn() },
      target: document.createElement('div')
    } as unknown as DragEvent
    
    handleDragStart(mockEvent, 1)
    
    expect(isItemDragged(0)).toBe(false)
    expect(isItemDragged(1)).toBe(true)
    expect(isItemDragged(2)).toBe(false)
  })

  it('isItemDraggedOver returns correct value', () => {
    const { handleDragStart, handleDragOver, isItemDraggedOver } = useDragAndDrop(items, onReorder)
    
    const startEvent = {
      dataTransfer: { effectAllowed: '', setData: vi.fn() },
      target: document.createElement('div')
    } as unknown as DragEvent
    
    const overEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { dropEffect: '' }
    } as unknown as DragEvent
    
    handleDragStart(startEvent, 0)
    handleDragOver(overEvent, 2)
    
    expect(isItemDraggedOver(0)).toBe(false)
    expect(isItemDraggedOver(2)).toBe(true)
  })

  it('handles complex reordering: move item down', () => {
    const { handleDragStart, handleDrop } = useDragAndDrop(items, onReorder)
    
    const startEvent = {
      dataTransfer: { effectAllowed: '', setData: vi.fn() },
      target: document.createElement('div')
    } as unknown as DragEvent
    
    const dropEvent = {
      preventDefault: vi.fn()
    } as unknown as DragEvent
    
    handleDragStart(startEvent, 1) // Drag Item 2
    handleDrop(dropEvent, 3) // Drop at position 3
    
    expect(onReorder).toHaveBeenCalledWith(['Item 1', 'Item 3', 'Item 4', 'Item 2'])
  })

  it('handles complex reordering: move item up', () => {
    const { handleDragStart, handleDrop } = useDragAndDrop(items, onReorder)
    
    const startEvent = {
      dataTransfer: { effectAllowed: '', setData: vi.fn() },
      target: document.createElement('div')
    } as unknown as DragEvent
    
    const dropEvent = {
      preventDefault: vi.fn()
    } as unknown as DragEvent
    
    handleDragStart(startEvent, 3) // Drag Item 4
    handleDrop(dropEvent, 0) // Drop at position 0
    
    expect(onReorder).toHaveBeenCalledWith(['Item 4', 'Item 1', 'Item 2', 'Item 3'])
  })
})
