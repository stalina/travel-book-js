import type { StepPageLayout } from './editor.types'

export const STEP_PAGE_LAYOUT_CAPACITY: Record<StepPageLayout, number> = {
  'grid-2x2': 4,
  'hero-plus-2': 3,
  'three-columns': 3,
  'full-page': 1
}

export const getLayoutCapacity = (layout: StepPageLayout): number => {
  return STEP_PAGE_LAYOUT_CAPACITY[layout] ?? Number.POSITIVE_INFINITY
}
