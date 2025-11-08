import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useEditorStore } from '../../src/stores/editor.store'
import type { Trip, Step } from '../../src/models/types'
import { StepBuilder } from '../../src/services/builders/step.builder'

vi.mock('../../src/components/editor/StepTitleEditor.vue', () => ({
	default: defineComponent({
		name: 'StepTitleEditorStub',
		props: {
			modelValue: {
				type: String,
				default: ''
			}
		},
		emits: ['update:modelValue'],
		template: '<div class="step-title-editor-stub"></div>'
	})
}))

vi.mock('../../src/components/editor/PhotoGrid.vue', () => ({
	default: defineComponent({
		name: 'PhotoGridStub',
		props: {
			photos: {
				type: Array,
				default: () => []
			}
		},
		emits: ['add', 'edit', 'reorder', 'delete'],
		template: '<div class="photo-grid-stub"></div>'
	})
}))

vi.mock('../../src/components/editor/RichTextEditor.vue', () => ({
	default: defineComponent({
		name: 'RichTextEditorStub',
		props: {
			modelValue: {
				type: String,
				default: ''
			}
		},
		emits: ['update:modelValue'],
		template: '<div class="rich-text-editor-stub"></div>'
	})
}))

import StepEditor from '../../src/components/editor/StepEditor.vue'

const createStep = (overrides: Partial<Step> = {}): Step => ({
	id: 1,
	name: 'Étape Test',
	description: 'Description initiale',
	city: 'Paris',
	country: 'France',
	country_code: 'FR',
	weather_condition: 'Ensoleillé',
	weather_temperature: 23,
	start_time: 1_609_459_200,
	lat: 48.8566,
	lon: 2.3522,
	slug: 'etape-test',
	...overrides
})

const createTrip = (overrides: Partial<Trip> = {}): Trip => ({
	id: 10,
	name: 'Voyage Test',
	start_date: 1_609_372_800,
	end_date: 1_609_459_200,
	steps: [createStep()],
	cover_photo: null,
	summary: 'Résumé',
	...overrides
})

describe('StepEditor', () => {
	const createMockFile = (name: string) => new File(['x'], name, { type: 'image/jpeg' })

	beforeEach(() => {
		setActivePinia(createPinia())
		;(window as any).__parsedTrip = {
			stepPhotos: {
				1: [createMockFile('photo-1.jpg'), createMockFile('photo-2.jpg'), createMockFile('photo-3.jpg')]
			}
		}
		vi.spyOn(StepBuilder.prototype, 'build').mockResolvedValue('<div data-test="step">Prévisualisation</div>')
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.useRealTimers()
	})

	it('affiche un état vide quand aucune étape est sélectionnée', async () => {
		const wrapper = mount(StepEditor)
		await flushPromises()

		expect(wrapper.find('.empty-state').exists()).toBe(true)
		expect(wrapper.text()).toContain('Sélectionnez une étape')
	})

	it('affiche la proposition et la prévisualisation pour une étape sélectionnée', async () => {
		const wrapper = mount(StepEditor)
		const store = useEditorStore()
		const trip = createTrip()

		await store.setTrip(trip)
		store.setCurrentStep(0)
		await flushPromises()

		expect(wrapper.find('.proposal-section').exists()).toBe(true)
		expect(wrapper.find('.proposal-summary').text()).toContain('Jour')
		expect(wrapper.find('iframe.preview-frame').exists()).toBe(true)
	})

	it('lance la régénération de proposition lors du clic sur le bouton dédié', async () => {
		const wrapper = mount(StepEditor)
		const store = useEditorStore()
		const trip = createTrip()

		const regenerateSpy = vi.spyOn(store, 'regenerateCurrentStepProposal')

		await store.setTrip(trip)
		store.setCurrentStep(0)
		await flushPromises()

			await wrapper.find('.proposal-section button.secondary').trigger('click')

		expect(regenerateSpy).toHaveBeenCalled()
	})

	it('désactive le bouton de validation après acceptation et affiche la date', async () => {
		const wrapper = mount(StepEditor)
		const store = useEditorStore()
		const trip = createTrip()

		await store.setTrip(trip)
		store.setCurrentStep(0)
		await flushPromises()

		const validateButton = wrapper.find('button.primary')
		expect(validateButton.attributes('disabled')).toBeUndefined()

		await validateButton.trigger('click')
		await flushPromises()

		expect(wrapper.find('.proposal-accepted').text()).toContain('Dernière validation')
		expect(validateButton.attributes('disabled')).toBe('')
	})

	it('rafraîchit l\'aperçu lorsqu\'on clique sur « Actualiser »', async () => {
		const wrapper = mount(StepEditor)
		const store = useEditorStore()
		const trip = createTrip()
		const previewSpy = vi.spyOn(store, 'regenerateCurrentStepPreview')

		await store.setTrip(trip)
		store.setCurrentStep(0)
		await flushPromises()

		await wrapper.find('.preview-section button.secondary').trigger('click')

		expect(previewSpy).toHaveBeenCalled()
	})

		it('gère l\'ajout de pages, le choix de layout et la sélection de couverture', async () => {
			vi.useFakeTimers()
			const wrapper = mount(StepEditor)
			const store = useEditorStore()
			const trip = createTrip()

			await store.setTrip(trip)
			store.setCurrentStep(0)
			await flushPromises()

			await wrapper.find('[data-test="add-page"]').trigger('click')
			await flushPromises()
			expect(store.currentStepPages).toHaveLength(1)

			await wrapper.find('[data-test="layout-option-three-columns"]').trigger('click')
			expect(store.currentStepActivePage?.layout).toBe('three-columns')

			await wrapper.find('[data-test="page-photo-toggle-1"]').trigger('click')
			expect(store.currentStepActivePage?.photoIndices).toContain(1)

			await wrapper.find('[data-test="cover-option-1"]').trigger('click')
			expect(store.currentStepPageState?.coverPhotoIndex).toBe(1)

			await wrapper.find('[data-test="add-page"]').trigger('click')
			await flushPromises()
			expect(store.currentStepPages).toHaveLength(2)

			await wrapper.find('[data-test="page-chip-2"]').trigger('click')
			expect(store.currentStepActivePage?.id).toBe(store.currentStepPages[1].id)

			await wrapper.find('[data-test="move-page-left"]').trigger('click')
			vi.runAllTimers()
			await flushPromises()
			expect(store.currentStepPages[0].id).toBe(store.currentStepActivePage?.id)
		})
})
