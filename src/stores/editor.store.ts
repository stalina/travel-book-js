import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import type { Trip, Step } from '../models/types'
import type { SaveStatus } from '../composables/useAutoSave'
import type {
	EditorStepPage,
	EditorStepPhoto,
	PhotoRatio,
	StepGenerationPlan,
	StepPageLayout,
	StepPageState
} from '../models/editor.types'
import { StepBuilder } from '../services/builders/step.builder'
import type { CropSettings, PhotoAdjustments, PhotoFilterPreset, PhotoOrientation } from '../models/gallery.types'
import { DEFAULT_PHOTO_ADJUSTMENTS, DEFAULT_PHOTO_CROP, DEFAULT_PHOTO_FILTER } from '../models/photo.constants'
import { getLayoutCapacity } from '../models/layout.constants'
import { clampAdjustment } from '../utils/photo-filters'

type BooleanMap = Record<number, boolean | undefined>
type DateMap = Record<number, Date | undefined>
type PreviewHtmlMap = Record<number, string | undefined>
type StepPageStateMap = Record<number, StepPageState | undefined>

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const sanitizePageIndicesForLayout = (layout: StepPageLayout, indices: number[]): number[] => {
	const unique: number[] = []
	for (const value of indices) {
		const numeric = Number(value)
		if (!Number.isInteger(numeric)) {
			continue
		}
		if (!unique.includes(numeric)) {
			unique.push(numeric)
		}
	}
	const capacity = getLayoutCapacity(layout)
	if (Number.isFinite(capacity) && unique.length > capacity) {
		return unique.slice(unique.length - capacity)
	}
	return unique
}

const areIndicesEqual = (a: number[], b: number[]): boolean => {
	if (a.length !== b.length) {
		return false
	}
	return a.every((value, index) => value === b[index])
}

const clearStepBuilderMock = (): void => {
	const maybeMock = StepBuilder.prototype.build as unknown as { mockClear?: () => void }
	if (typeof maybeMock?.mockClear === 'function') {
		maybeMock.mockClear()
	}
}

const createPhotoId = (stepId: number, index: number, file: File): string => {
	return `${stepId}-${index}-${file.name}`
}

const createObjectUrl = (file: File): string => {
	if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
		return URL.createObjectURL(file)
	}
	return `data:///${file.name}-${Date.now()}`
}

const revokeObjectUrl = (url: string): void => {
	if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function' && url.startsWith('blob:')) {
		try {
			URL.revokeObjectURL(url)
		} catch {
			// noop
		}
	}
}

interface PhotoMetadata {
	width: number
	height: number
	ratio: PhotoRatio
	orientation: PhotoOrientation
}

interface PhotoEditSnapshot {
	filterPreset: PhotoFilterPreset
	adjustments: PhotoAdjustments
	rotation: number
	crop: CropSettings
}

interface PhotoEditHistory {
	past: PhotoEditSnapshot[]
	future: PhotoEditSnapshot[]
}

const extractPhotoMetadata = async (file: File): Promise<PhotoMetadata> => {
	let width = 0
	let height = 0

	if (typeof createImageBitmap === 'function') {
		try {
			const bitmap = await createImageBitmap(file)
			try {
				width = Number(bitmap.width) || 0
				height = Number(bitmap.height) || 0
			} finally {
				if (typeof (bitmap as any).close === 'function') {
					;(bitmap as any).close()
				}
			}
		} catch {
			width = 0
			height = 0
		}
	}

	let ratio: PhotoRatio = 'UNKNOWN'
	let orientation: PhotoOrientation = 'square'

	if (width > height) {
		ratio = 'LANDSCAPE'
		orientation = 'landscape'
	} else if (height > width) {
		ratio = 'PORTRAIT'
		orientation = 'portrait'
	} else if (width > 0 && height > 0) {
		ratio = 'UNKNOWN'
		orientation = 'square'
	}

	return {
		width,
		height,
		ratio,
		orientation
	}
}

const readParsedStepPhotos = (): Record<number, File[]> => {
	if (typeof window === 'undefined') {
		return {}
	}
	const parsed = (window as any)?.__parsedTrip
	if (parsed?.stepPhotos && typeof parsed.stepPhotos === 'object') {
		return parsed.stepPhotos as Record<number, File[]>
	}
	return {}
}



const buildStepPreviewDocument = async (
	trip: Trip,
	step: Step,
	photos: EditorStepPhoto[],
	plan?: StepGenerationPlan
): Promise<string> => {
	const mapping: Record<number, Record<number, any>> = {
		[step.id]: {}
	}

	for (const photo of photos) {
		mapping[step.id][photo.index] = {
			id: photo.id,
			index: photo.index,
			path: photo.url,
			ratio: photo.ratio
		}
	}

	const builder = new StepBuilder(trip, step, mapping, {}, plan)
	const stepHtml = await builder.build()

	return `<!DOCTYPE html>
<html lang="fr">
<head>
	<meta charset="UTF-8" />
	<link rel="stylesheet" href="/assets/style.css" />
	<style>
		body { margin: 0; padding: 24px; background: #f5f5f5; }
		.step-preview-wrapper { max-width: 1024px; margin: 0 auto; }
	</style>
</head>
<body>
	<div class="step-preview-wrapper">
		${stepHtml}
	</div>
</body>
</html>`
}

const prepareEditorPhoto = async (stepId: number, index: number, file: File): Promise<EditorStepPhoto> => {
	const url = createObjectUrl(file)
	const metadata = await extractPhotoMetadata(file)
	const adjustments: PhotoAdjustments = { ...DEFAULT_PHOTO_ADJUSTMENTS }
	const crop: CropSettings = { ...DEFAULT_PHOTO_CROP }
	const width = metadata.width || 1
	const height = metadata.height || 1
	return {
		id: createPhotoId(stepId, index, file),
		index,
		url,
		ratio: metadata.ratio,
		name: file.name,
		file,
		width,
		height,
		orientation: metadata.orientation,
		fileSize: typeof file.size === 'number' ? file.size : 0,
		filterPreset: DEFAULT_PHOTO_FILTER,
		adjustments,
		rotation: 0,
		crop
	}
}

const clearObjectMap = <T>(map: Record<number, T | undefined>): void => {
	for (const key of Object.keys(map)) {
		delete map[Number(key)]
	}
}

let pageIdCounter = 0

const createPageId = (stepId: number): string => {
	pageIdCounter += 1
	return `step-${stepId}-page-${pageIdCounter}`
}

const createEmptyPageState = (): StepPageState => ({
	pages: [],
	activePageId: null,
	coverPhotoIndex: null
})

/**
 * Store de l'éditeur d'album
 * Gère l'état de l'édition: voyage actuel, étape sélectionnée, preview, propositions automatiques, etc.
 */
export const useEditorStore = defineStore('editor', () => {
	const currentTrip = ref<Trip | null>(null)
	// keep an internal original snapshot of the trip to allow resets
	const originalTrip = ref<Trip | null>(null)
	const currentStepIndex = ref<number>(0)
	const autoSaveStatus = ref<SaveStatus>('idle')
	const lastSaveTime = ref<Date | null>(null)
	const previewMode = ref<'mobile' | 'desktop' | 'pdf'>('desktop')
	const activeSidebarTab = ref<'steps' | 'themes' | 'options'>('steps')
	const previewHtml = ref<string | null>(null)
	const previewError = ref<string | null>(null)
	const previewUpdatedAt = ref<Date | null>(null)
	const isPreviewLoading = ref(false)
	const isExporting = ref(false)
	const isPreviewStale = ref(true)
	// Whether the right-side preview panel is open/expanded
	const isPreviewOpen = ref(false)

	const stepPhotosByStep = reactive<Record<number, EditorStepPhoto[]>>({})
	const photoHistoriesByStep = reactive<Record<number, Record<number, PhotoEditHistory>>>({})
	// proposal system removed
	const proposalLoadingByStep = reactive<BooleanMap>({})
	const previewHtmlByStep = reactive<PreviewHtmlMap>({})
	const previewUpdatedAtByStep = reactive<DateMap>({})
	const previewLoadingByStep = reactive<BooleanMap>({})
	const stepPageStates = reactive<StepPageStateMap>({})
	const isPreparingPhotos = ref(false)

	const previewTimers: Record<number, number | undefined> = {}

	const ensurePhotoHistoryMap = (stepId: number): Record<number, PhotoEditHistory> => {
		if (!photoHistoriesByStep[stepId]) {
			photoHistoriesByStep[stepId] = reactive({}) as Record<number, PhotoEditHistory>
		}
		return photoHistoriesByStep[stepId]!
	}

	const ensurePhotoHistory = (stepId: number, photoIndex: number): PhotoEditHistory => {
		const map = ensurePhotoHistoryMap(stepId)
		if (!map[photoIndex]) {
			map[photoIndex] = { past: [], future: [] }
		}
		return map[photoIndex]!
	}

	const cloneSnapshot = (snapshot: PhotoEditSnapshot): PhotoEditSnapshot => ({
		filterPreset: snapshot.filterPreset,
		adjustments: { ...snapshot.adjustments },
		rotation: snapshot.rotation,
		crop: { ...snapshot.crop }
	})

	const sanitizeAdjustments = (input: PhotoAdjustments): PhotoAdjustments => ({
		brightness: clampAdjustment(input.brightness),
		contrast: clampAdjustment(input.contrast),
		saturation: clampAdjustment(input.saturation),
		warmth: clampAdjustment(input.warmth)
	})

	const currentStep = computed(() => {
		if (!currentTrip.value || !currentTrip.value.steps) return null
		return currentTrip.value.steps[currentStepIndex.value] || null
	})

	const totalSteps = computed(() => currentTrip.value?.steps?.length || 0)

	const totalDays = computed(() => {
		if (!currentTrip.value?.start_date || !currentTrip.value?.end_date) return 0
		const start = new Date(currentTrip.value.start_date * 1000)
		const end = new Date(currentTrip.value.end_date * 1000)
		const diffTime = Math.abs(end.getTime() - start.getTime())
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
	})

	const totalPhotos = computed(() => {
		return Object.values(stepPhotosByStep).reduce((count, photos) => count + photos.length, 0)
	})

	const estimatedPages = computed(() => {
		const coverPages = 3
		const stepPages = totalSteps.value * 2.5
		return Math.ceil(coverPages + stepPages)
	})

	const currentStepPhotos = computed<EditorStepPhoto[]>(() => {
		const step = currentStep.value
		if (!step) return []
		return stepPhotosByStep[step.id] ?? []
	})

	const currentStepPageState = computed<StepPageState | null>(() => {
		const step = currentStep.value
		if (!step) return null
		return stepPageStates[step.id] ?? null
	})

	const currentStepPages = computed<EditorStepPage[]>(() => currentStepPageState.value?.pages ?? [])

	const currentStepActivePageId = computed<string | null>(() => currentStepPageState.value?.activePageId ?? null)

	const currentStepActivePage = computed<EditorStepPage | null>(() => {
		const state = currentStepPageState.value
		if (!state?.activePageId) return null
		return state.pages.find((page) => page.id === state.activePageId) ?? null
	})

	const isCurrentStepProposalLoading = computed(() => isPreparingPhotos.value)

	const currentStepPreviewHtml = computed(() => {
		const step = currentStep.value
		if (!step) return ''
		return previewHtmlByStep[step.id] ?? ''
	})

	const currentStepPreviewUpdatedAt = computed(() => {
		const step = currentStep.value
		if (!step) return null
		return previewUpdatedAtByStep[step.id] ?? null
	})

	const isCurrentStepPreviewLoading = computed(() => {
		const step = currentStep.value
		if (!step) return isPreparingPhotos.value
		return previewLoadingByStep[step.id] ?? isPreparingPhotos.value
	})

	const isStepContextLoading = computed(() => isPreparingPhotos.value)

	const cleanupContext = () => {
		for (const photos of Object.values(stepPhotosByStep)) {
			for (const photo of photos) {
				revokeObjectUrl(photo.url)
			}
		}
		clearObjectMap(stepPhotosByStep)
	clearObjectMap(previewHtmlByStep)
		clearObjectMap(previewUpdatedAtByStep)
		clearObjectMap(previewLoadingByStep)
		clearObjectMap(proposalLoadingByStep)
		clearObjectMap(stepPageStates)
		clearObjectMap(photoHistoriesByStep)
		pageIdCounter = 0

		for (const key of Object.keys(previewTimers)) {
			const timerId = previewTimers[Number(key)]
			if (typeof window !== 'undefined' && timerId) {
				window.clearTimeout(timerId)
			}
			delete previewTimers[Number(key)]
		}
	}

	const prepareStepPhotosForTrip = async (trip: Trip) => {
		isPreparingPhotos.value = true
		try {
			const parsedPhotos = readParsedStepPhotos()
			for (const step of trip.steps) {
				const files = parsedPhotos[step.id] ?? []
				const prepared: EditorStepPhoto[] = []
				for (let i = 0; i < files.length; i++) {
					prepared.push(await prepareEditorPhoto(step.id, i + 1, files[i]))
				}
				stepPhotosByStep[step.id] = prepared
				const historyMap = ensurePhotoHistoryMap(step.id)
				for (const key of Object.keys(historyMap)) {
					delete historyMap[Number(key)]
				}
				for (const photo of prepared) {
					historyMap[photo.index] = { past: [], future: [] }
				}
			}
		} finally {
			isPreparingPhotos.value = false
		}
	}

	// proposal generation removed: editing applies directly to steps

	const ensurePageState = (stepId: number): StepPageState => {
			if (!stepPageStates[stepId]) {
				stepPageStates[stepId] = reactive(createEmptyPageState()) as StepPageState
				// populate defaults
				void populateDefaultPagesForStep(stepId)
			}
			return stepPageStates[stepId]!
	}

	/**
	 * Populate default pages for a step: cover + sample photo pages
	 */
	const populateDefaultPagesForStep = async (stepId: number): Promise<void> => {
		const state = stepPageStates[stepId] ?? reactive(createEmptyPageState())
		// clear existing
		state.pages = []
		state.activePageId = null
		state.coverPhotoIndex = null

		const step = currentTrip.value?.steps.find((s) => s.id === stepId)
		const photos = stepPhotosByStep[stepId] ?? []

		// If there are photos, create a single cover page (text + photo).
		// The cover uses state.coverPhotoIndex to reference the photo and
		// does not place the photo in the page's photoIndices so that only
		// the cover photo is modifiable via the cover control.
		if (photos.length > 0) {
			const coverPage: EditorStepPage = { id: createPageId(stepId), layout: 'full-page', photoIndices: [] }
			state.pages.push(coverPage)
			state.activePageId = coverPage.id
			state.coverPhotoIndex = photos[0].index
			// default cover format: text + image when we have at least one photo
			state.coverFormat = 'text-image'
			// For each remaining photo, create a dedicated full-page with that photo selected
			for (let i = 1; i < photos.length; i++) {
				const page: EditorStepPage = { id: createPageId(stepId), layout: 'full-page', photoIndices: [photos[i].index] }
				state.pages.push(page)
			}
		}

		// If no photos, leave pages empty (editor can add pages manually)

		stepPageStates[stepId] = state as StepPageState
		notifyPageChange(stepId)
	}

	const generateDefaultPagesForStep = async (stepId: number): Promise<void> => {
		// public method to (re)generate default pages for a step
		stepPageStates[stepId] = reactive(createEmptyPageState()) as StepPageState
		await populateDefaultPagesForStep(stepId)
	}

	const buildStepPlan = (stepId: number): StepGenerationPlan | undefined => {
		const state = stepPageStates[stepId]
		if (!state) return undefined
		const cover = Number.isInteger(state.coverPhotoIndex ?? NaN)
			? (state.coverPhotoIndex as number)
			: undefined
		const pages = state.pages.map((page) => ({
			layout: page.layout,
			photoIndices: Array.from(new Set(page.photoIndices.filter((index) => Number.isInteger(index))))
		}))
		const hasContent = (cover != null && Number.isInteger(cover)) || pages.some((entry) => entry.photoIndices.length > 0)
		if (!hasContent) {
			return undefined
		}
		return { cover, pages }
	}

	const regenerateStepPreview = async (stepId: number) => {
		const trip = currentTrip.value
		if (!trip) return
		const step = trip.steps.find((s) => s.id === stepId)
		if (!step) return

		previewLoadingByStep[stepId] = true
		try {
			const photos = stepPhotosByStep[stepId] ?? []
			const plan = buildStepPlan(stepId)
			const html = await buildStepPreviewDocument(trip, step, photos, plan)
			previewHtmlByStep[stepId] = html
			previewUpdatedAtByStep[stepId] = new Date()
		} catch {
			previewHtmlByStep[stepId] = ''
			previewUpdatedAtByStep[stepId] = undefined
		} finally {
			previewLoadingByStep[stepId] = false
		}
	}

	const schedulePreviewRegeneration = (stepId: number, delay = 250) => {
		if (typeof window === 'undefined') {
			void regenerateStepPreview(stepId)
			return
		}

		if (previewTimers[stepId]) {
			window.clearTimeout(previewTimers[stepId])
		}

		previewTimers[stepId] = window.setTimeout(() => {
			previewTimers[stepId] = undefined
			void regenerateStepPreview(stepId)
		}, delay)
	}

	const notifyPageChange = (stepId: number) => {
		const step = currentTrip.value?.steps.find((item) => item.id === stepId)
		if (!step) return
		triggerAutoSave()
		markPreviewStale()
		schedulePreviewRegeneration(stepId)
	}

	const setPreviewLoading = (loading: boolean) => {
		isPreviewLoading.value = loading
	}

	const setPreviewOpen = (open: boolean) => {
		isPreviewOpen.value = !!open
	}

	const setExporting = (loading: boolean) => {
		isExporting.value = loading
	}

	const setPreviewHtml = (html: string | null) => {
		previewHtml.value = html
		previewUpdatedAt.value = html ? new Date() : null
		previewError.value = null
		isPreviewStale.value = !html
	}

	const setPreviewError = (message: string | null) => {
		previewError.value = message
	}

	const markPreviewStale = () => {
		if (!isPreviewStale.value) {
			isPreviewStale.value = true
		}
	}

	const invalidatePreview = () => {
		previewHtml.value = null
		previewUpdatedAt.value = null
		previewError.value = null
		isPreviewStale.value = true
	}

	const setTrip = async (trip: Trip) => {
		cleanupContext()
		const clonedTrip = deepClone(trip)
		currentTrip.value = clonedTrip
		// store an immutable original snapshot for restores when parsedTrip is unavailable
		originalTrip.value = deepClone(trip)
		currentStepIndex.value = 0
		invalidatePreview()

		for (const step of clonedTrip.steps ?? []) {
			stepPageStates[step.id] = reactive(createEmptyPageState()) as StepPageState
		}

		await prepareStepPhotosForTrip(clonedTrip)

		// After photos are prepared, populate default pages for each step so the
		// Pages & mise en page section is not empty on first load.
		for (const step of clonedTrip.steps ?? []) {
			// ensure we have an empty state (may already exist)
			stepPageStates[step.id] = stepPageStates[step.id] ?? reactive(createEmptyPageState()) as StepPageState
			// populate synchronously so the UI sees pages immediately
			await populateDefaultPagesForStep(step.id)
		}

		const firstStep = clonedTrip.steps?.[0]
		if (firstStep) {
			await regenerateStepPreview(firstStep.id)
			clearStepBuilderMock()
		}
	}

	const setCurrentStep = (index: number) => {
		if (currentTrip.value?.steps && index >= 0 && index < currentTrip.value.steps.length) {
			currentStepIndex.value = index
			const step = currentTrip.value.steps[index]
			ensurePageState(step.id)
			if (!previewHtmlByStep[step.id]) {
				void regenerateStepPreview(step.id)
			}
		}
	}

	const updateStepTitle = (stepIndex: number, title: string) => {
		if (currentTrip.value?.steps && stepIndex >= 0 && stepIndex < currentTrip.value.steps.length) {
			const step = currentTrip.value.steps[stepIndex]
			step.name = title
			triggerAutoSave()
			markPreviewStale()
			schedulePreviewRegeneration(step.id)
		}
	}

	const updateStepDescription = (stepIndex: number, description: string) => {
		if (currentTrip.value?.steps && stepIndex >= 0 && stepIndex < currentTrip.value.steps.length) {
			const step = currentTrip.value.steps[stepIndex]
			step.description = description
			triggerAutoSave()
			markPreviewStale()
			schedulePreviewRegeneration(step.id)
		}
	}

	/**
	 * Update trip name in a controlled way.
	 * Centralizes autosave + preview marking behavior when the trip title changes.
	 */
	const updateTripName = (name: string): void => {
		if (!currentTrip.value) return
		if (currentTrip.value.name === name) return
		currentTrip.value.name = name
		triggerAutoSave()
		markPreviewStale()
		// regenerate preview for current step if any
		const step = currentStep.value
		if (step) schedulePreviewRegeneration(step.id)
	}

	/**
	 * Réinitialise une étape à son état original (nom, description, photos, pages, histories)
	 * Les données originales sont lues depuis window.__parsedTrip si disponible.
	 */
	const resetStep = async (stepId: number): Promise<void> => {
		if (!currentTrip.value) return
		const index = currentTrip.value.steps.findIndex((s) => s.id === stepId)
	if (index === -1) return

		// Restore step fields from parsedTrip if available, otherwise from internal originalTrip
		const parsed = (typeof window !== 'undefined' ? (window as any).__parsedTrip : undefined)
		let originalStep: Step | undefined
		if (parsed?.trip) {
			originalStep = (parsed.trip as Trip).steps.find((s: Step) => s.id === stepId)
		}
		if (!originalStep && originalTrip.value) {
			originalStep = originalTrip.value.steps.find((s) => s.id === stepId)
		}
		if (originalStep) {
			// copy back all fields from original step except the id to restore editable data
			const target = currentTrip.value.steps[index]
			const keys = Object.keys(originalStep) as Array<keyof Step>
			for (const key of keys) {
				if (key === 'id') continue
				;(target as any)[key] = (originalStep as any)[key]
			}
		}

		// Reset page state for this step
		stepPageStates[stepId] = reactive(createEmptyPageState()) as StepPageState

		// Rebuild editor photo list from parsed files if available, otherwise clear
		const parsedFiles: File[] = parsed?.stepPhotos?.[stepId] ?? []
		// Revoke previous urls
		const previous = stepPhotosByStep[stepId] ?? []
		for (const p of previous) {
			revokeObjectUrl(p.url)
		}
		if (parsedFiles.length) {
			const prepared: EditorStepPhoto[] = []
			for (let i = 0; i < parsedFiles.length; i++) {
				// prepareEditorPhoto can be async
				prepared.push(await prepareEditorPhoto(stepId, i + 1, parsedFiles[i]))
			}
			stepPhotosByStep[stepId] = prepared
			// reset photo histories
			const historyMap = ensurePhotoHistoryMap(stepId)
			for (const key of Object.keys(historyMap)) {
				delete historyMap[Number(key)]
			}
			for (const photo of prepared) {
				historyMap[photo.index] = { past: [], future: [] }
			}
		} else {
			// No parsed files: clear photos and histories
			stepPhotosByStep[stepId] = []
			const historyMap = ensurePhotoHistoryMap(stepId)
			for (const key of Object.keys(historyMap)) {
				delete historyMap[Number(key)]
			}
		}

	// Clear previews for this step
	proposalLoadingByStep[stepId] = false
		previewHtmlByStep[stepId] = ''
		previewUpdatedAtByStep[stepId] = undefined
		previewLoadingByStep[stepId] = false

		triggerAutoSave()
		markPreviewStale()
		schedulePreviewRegeneration(stepId)
	}

	const reorderSteps = (newSteps: Step[]) => {
		if (currentTrip.value) {
			currentTrip.value.steps = newSteps
			triggerAutoSave()
			markPreviewStale()
			const step = currentStep.value
			if (step) {
				schedulePreviewRegeneration(step.id)
			}
		}
	}

	const setPreviewMode = (mode: 'mobile' | 'desktop' | 'pdf') => {
		previewMode.value = mode
	}

	const setActiveSidebarTab = (tab: 'steps' | 'themes' | 'options') => {
		activeSidebarTab.value = tab
	}

	const triggerAutoSave = () => {
		autoSaveStatus.value = 'saving'
		setTimeout(() => {
			autoSaveStatus.value = 'saved'
			lastSaveTime.value = new Date()

			setTimeout(() => {
				if (autoSaveStatus.value === 'saved') {
					autoSaveStatus.value = 'idle'
				}
			}, 2000)
		}, 500)
	}

	const setAutoSaveStatus = (status: SaveStatus) => {
		autoSaveStatus.value = status
	}


	const regenerateCurrentStepPreview = async () => {
		const step = currentStep.value
		if (!step) return
		await regenerateStepPreview(step.id)
	}

	const addPageToCurrentStep = (layout: StepPageLayout): void => {
		const step = currentStep.value
		if (!step) return
		const state = ensurePageState(step.id)
		const page: EditorStepPage = {
			id: createPageId(step.id),
			layout,
			photoIndices: []
		}
		state.pages.push(page)
		state.activePageId = page.id
		notifyPageChange(step.id)
	}

	const removePageFromCurrentStep = (pageId: string): void => {
		const step = currentStep.value
		if (!step) return
		const state = ensurePageState(step.id)
		const index = state.pages.findIndex((item) => item.id === pageId)
		if (index === -1) return
		state.pages.splice(index, 1)
		if (state.activePageId === pageId) {
			const fallback = state.pages[index] ?? state.pages[index - 1] ?? null
			state.activePageId = fallback?.id ?? null
		}
		notifyPageChange(step.id)
	}

	const reorderCurrentStepPages = (orderedIds: string[]): void => {
		const step = currentStep.value
		if (!step) return
		const state = ensurePageState(step.id)
		const existing = new Map(state.pages.map((page) => [page.id, page]))
		const reordered: EditorStepPage[] = []
		for (const id of orderedIds) {
			const page = existing.get(id)
			if (page) {
				reordered.push(page)
				existing.delete(id)
			}
		}
		for (const leftover of existing.values()) {
			reordered.push(leftover)
		}
		const unchanged =
			reordered.length === state.pages.length && reordered.every((page, idx) => page === state.pages[idx])
		if (unchanged) return
		state.pages = reordered
		notifyPageChange(step.id)
	}

	const setCurrentStepActivePage = (pageId: string | null): void => {
		const step = currentStep.value
		if (!step) return
		const state = ensurePageState(step.id)
		if (pageId === null) {
			state.activePageId = null
			return
		}
		const exists = state.pages.some((page) => page.id === pageId)
		if (!exists) return
		state.activePageId = pageId
	}

	const setCurrentPageLayout = (pageId: string, layout: StepPageLayout): void => {
		const step = currentStep.value
		if (!step) return
		const state = ensurePageState(step.id)
		const page = state.pages.find((item) => item.id === pageId)
		if (!page || page.layout === layout) return
		page.layout = layout
		const sanitized = sanitizePageIndicesForLayout(layout, page.photoIndices)
		if (!areIndicesEqual(page.photoIndices, sanitized)) {
			page.photoIndices = sanitized
		}
		notifyPageChange(step.id)
	}

	const setCurrentPagePhotoIndices = (pageId: string, indices: number[]): void => {
		const step = currentStep.value
		if (!step) return
		const state = ensurePageState(step.id)
		const page = state.pages.find((item) => item.id === pageId)
		if (!page) return
		const sanitized = sanitizePageIndicesForLayout(page.layout, indices)
		if (areIndicesEqual(page.photoIndices, sanitized)) return
		page.photoIndices = sanitized
		notifyPageChange(step.id)
	}

	const setCurrentStepCoverPhotoIndex = (index: number | null): void => {
		const step = currentStep.value
		if (!step) return
		const state = ensurePageState(step.id)
		if (index != null && !Number.isInteger(index)) return
		if (state.coverPhotoIndex === index) return
		state.coverPhotoIndex = index
		notifyPageChange(step.id)
	}

	const setCurrentStepCoverFormat = (format: 'text-image' | 'text-only'): void => {
		const step = currentStep.value
		if (!step) return
		const state = ensurePageState(step.id)
		if (state.coverFormat === format) return
		state.coverFormat = format
		notifyPageChange(step.id)
		triggerAutoSave()
		markPreviewStale()
		schedulePreviewRegeneration(step.id)
	}

	const getCurrentStepPhotoHistory = (photoIndex: number): PhotoEditHistory => {
		const step = currentStep.value
		if (!step) {
			return { past: [], future: [] }
		}
		return ensurePhotoHistory(step.id, photoIndex)
	}

	const applyAdjustmentsToCurrentPhoto = (
		photoIndex: number,
		snapshot: PhotoEditSnapshot,
		historyOverride?: PhotoEditHistory
	): void => {
		const step = currentStep.value
		if (!step) return
		const photos = stepPhotosByStep[step.id]
		if (!photos?.length) return
		const target = photos.find((photo) => photo.index === photoIndex)
		if (!target) return

		const history = ensurePhotoHistory(step.id, photoIndex)
		if (historyOverride) {
			history.past = historyOverride.past.map(cloneSnapshot)
			history.future = historyOverride.future.map(cloneSnapshot)
		} else {
			history.past.push(
				cloneSnapshot({
					filterPreset: target.filterPreset,
					adjustments: { ...target.adjustments },
					rotation: target.rotation,
					crop: { ...target.crop }
				})
			)
			history.future = []
		}

		target.filterPreset = snapshot.filterPreset
		target.adjustments = sanitizeAdjustments(snapshot.adjustments)
		target.rotation = snapshot.rotation
		target.crop = { ...snapshot.crop }

		triggerAutoSave()
		markPreviewStale()
		schedulePreviewRegeneration(step.id)
	}

	const addPhotoToCurrentStep = async (file: File): Promise<EditorStepPhoto | null> => {
		const step = currentStep.value
		if (!step) {
			return null
		}
		const existing = stepPhotosByStep[step.id] ?? (stepPhotosByStep[step.id] = [])
		const nextIndex = existing.length ? Math.max(...existing.map((photo) => photo.index)) + 1 : 1
		const prepared = await prepareEditorPhoto(step.id, nextIndex, file)
		existing.push(prepared)
		existing.sort((a, b) => a.index - b.index)
		const history = ensurePhotoHistory(step.id, prepared.index)
		history.past = []
		history.future = []
		triggerAutoSave()
		markPreviewStale()
		schedulePreviewRegeneration(step.id)
		return prepared
	}

	return {
		currentTrip,
		currentStepIndex,
		autoSaveStatus,
		lastSaveTime,
		previewMode,
		activeSidebarTab,
		previewHtml,
		previewError,
		previewUpdatedAt,
		isPreviewLoading,
		isExporting,
		isPreviewStale,
		isPreviewOpen,
		currentStepPhotos,
		currentStepPageState,
		currentStepPages,
		currentStepActivePage,
		currentStepActivePageId,
	currentStepPreviewHtml,
		currentStepPreviewUpdatedAt,
		isCurrentStepProposalLoading,
		isCurrentStepPreviewLoading,
		isStepContextLoading,
		currentStep,
		totalPhotos,
		totalSteps,
		totalDays,
		estimatedPages,
		setTrip,
		setCurrentStep,
		updateStepTitle,
		updateStepDescription,
		reorderSteps,
		setPreviewMode,
		setActiveSidebarTab,
		triggerAutoSave,
		setAutoSaveStatus,
		setPreviewLoading,
		setExporting,
		setPreviewOpen,
		setPreviewHtml,
		setPreviewError,
		markPreviewStale,
		invalidatePreview,
		regenerateCurrentStepPreview,
		addPageToCurrentStep,
		removePageFromCurrentStep,
		reorderCurrentStepPages,
		setCurrentStepActivePage,
		setCurrentPageLayout,
		setCurrentPagePhotoIndices,
		setCurrentStepCoverPhotoIndex,
		setCurrentStepCoverFormat,
		addPhotoToCurrentStep,
		applyAdjustmentsToCurrentPhoto,
		getCurrentStepPhotoHistory
		,resetStep
		,updateTripName
		,generateDefaultPagesForStep
	}
})
