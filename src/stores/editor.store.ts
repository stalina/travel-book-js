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
	StepPageState,
	StepProposal
} from '../models/editor.types'
import { stepProposalService } from '../services/editor/step-proposal.service'
import { StepBuilder } from '../services/builders/step.builder'

interface ProposalState {
	draft: StepProposal
	accepted?: StepProposal
}

type ProposalMap = Record<number, ProposalState | undefined>
type BooleanMap = Record<number, boolean | undefined>
type DateMap = Record<number, Date | undefined>
type PreviewHtmlMap = Record<number, string | undefined>
type StepPageStateMap = Record<number, StepPageState | undefined>

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

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

const detectPhotoRatio = async (file: File): Promise<PhotoRatio> => {
	if (typeof createImageBitmap !== 'function') {
		return 'UNKNOWN'
	}

	try {
		const bitmap = await createImageBitmap(file)
		try {
			if (bitmap.width > bitmap.height) return 'LANDSCAPE'
			if (bitmap.height > bitmap.width) return 'PORTRAIT'
			return 'UNKNOWN'
		} finally {
			if (typeof (bitmap as any).close === 'function') {
				;(bitmap as any).close()
			}
		}
	} catch {
		return 'UNKNOWN'
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

const cloneProposal = (proposal: StepProposal): StepProposal => {
	return JSON.parse(JSON.stringify(proposal)) as StepProposal
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
	const ratio = await detectPhotoRatio(file)
	return {
		id: createPhotoId(stepId, index, file),
		index,
		url,
		ratio,
		name: file.name,
		file
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

	const stepPhotosByStep = reactive<Record<number, EditorStepPhoto[]>>({})
	const proposalStates = reactive<ProposalMap>({})
	const proposalLoadingByStep = reactive<BooleanMap>({})
	const previewHtmlByStep = reactive<PreviewHtmlMap>({})
	const previewUpdatedAtByStep = reactive<DateMap>({})
	const previewLoadingByStep = reactive<BooleanMap>({})
	const stepPageStates = reactive<StepPageStateMap>({})
	const isPreparingPhotos = ref(false)

	const previewTimers: Record<number, number | undefined> = {}

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

	const currentStepProposal = computed<StepProposal | null>(() => {
		const step = currentStep.value
		if (!step) return null
		return proposalStates[step.id]?.draft ?? null
	})

	const currentStepAcceptedProposal = computed<StepProposal | null>(() => {
		const step = currentStep.value
		if (!step) return null
		return proposalStates[step.id]?.accepted ?? null
	})

	const isCurrentStepProposalLoading = computed(() => {
		const step = currentStep.value
		if (!step) return isPreparingPhotos.value
		return proposalLoadingByStep[step.id] ?? isPreparingPhotos.value
	})

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
		clearObjectMap(proposalStates)
		clearObjectMap(previewHtmlByStep)
		clearObjectMap(previewUpdatedAtByStep)
		clearObjectMap(previewLoadingByStep)
		clearObjectMap(proposalLoadingByStep)
		clearObjectMap(stepPageStates)
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
			}
		} finally {
			isPreparingPhotos.value = false
		}
	}

	const ensureStepProposal = async (stepId: number, force = false): Promise<StepProposal | null> => {
		const trip = currentTrip.value
		if (!trip) return null
		const step = trip.steps.find((s) => s.id === stepId)
		if (!step) return null

		if (!force && proposalStates[stepId]?.draft) {
			return proposalStates[stepId]!.draft
		}

		if (proposalLoadingByStep[stepId]) {
			return proposalStates[stepId]?.draft ?? null
		}

		proposalLoadingByStep[stepId] = true
		try {
			const photos = stepPhotosByStep[stepId] ?? []
			const proposal = stepProposalService.generate(trip, step, photos)
			const previous = proposalStates[stepId]
			proposalStates[stepId] = {
				draft: proposal,
				accepted: previous?.accepted
			}
			return proposal
		} finally {
			proposalLoadingByStep[stepId] = false
		}
	}

	const ensurePageState = (stepId: number): StepPageState => {
		if (!stepPageStates[stepId]) {
			stepPageStates[stepId] = reactive(createEmptyPageState()) as StepPageState
		}
		return stepPageStates[stepId]!
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
		currentStepIndex.value = 0
		invalidatePreview()

		for (const step of clonedTrip.steps ?? []) {
			stepPageStates[step.id] = reactive(createEmptyPageState()) as StepPageState
		}

		await prepareStepPhotosForTrip(clonedTrip)

		const firstStep = clonedTrip.steps?.[0]
		if (firstStep) {
			await ensureStepProposal(firstStep.id, true)
			await regenerateStepPreview(firstStep.id)
		}
	}

	const setCurrentStep = (index: number) => {
		if (currentTrip.value?.steps && index >= 0 && index < currentTrip.value.steps.length) {
			currentStepIndex.value = index
			const step = currentTrip.value.steps[index]
			void ensureStepProposal(step.id)
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

	const regenerateCurrentStepProposal = async () => {
		const step = currentStep.value
		if (!step) return
		await ensureStepProposal(step.id, true)
	}

	const acceptCurrentStepProposal = () => {
		const step = currentStep.value
		if (!step) return
		const state = proposalStates[step.id]
		if (!state?.draft) return
		const alreadyAccepted = state.accepted?.generatedAt === state.draft.generatedAt
		if (alreadyAccepted) {
			return
		}
		const acceptedCopy = cloneProposal(state.draft)
		proposalStates[step.id] = {
			draft: state.draft,
			accepted: acceptedCopy
		}
		step.description = acceptedCopy.description
		triggerAutoSave()
		markPreviewStale()
		schedulePreviewRegeneration(step.id, 0)
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
		notifyPageChange(step.id)
	}

	const setCurrentPagePhotoIndices = (pageId: string, indices: number[]): void => {
		const step = currentStep.value
		if (!step) return
		const state = ensurePageState(step.id)
		const page = state.pages.find((item) => item.id === pageId)
		if (!page) return
		const sanitized = Array.from(new Set(indices.filter((index) => Number.isInteger(index)))).map((value) => Number(value))
		const sameLength = sanitized.length === page.photoIndices.length
		const sameValues = sameLength && sanitized.every((value, idx) => value === page.photoIndices[idx])
		if (sameValues) return
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
		currentStepPhotos,
		currentStepPageState,
		currentStepPages,
		currentStepActivePage,
		currentStepActivePageId,
		currentStepProposal,
		currentStepAcceptedProposal,
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
		setPreviewHtml,
		setPreviewError,
		markPreviewStale,
		invalidatePreview,
		regenerateCurrentStepProposal,
		acceptCurrentStepProposal,
		regenerateCurrentStepPreview,
		addPageToCurrentStep,
		removePageFromCurrentStep,
		reorderCurrentStepPages,
		setCurrentStepActivePage,
		setCurrentPageLayout,
		setCurrentPagePhotoIndices,
		setCurrentStepCoverPhotoIndex
	}
})
