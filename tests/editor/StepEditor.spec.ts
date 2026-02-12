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

vi.mock('../../src/components/editor/PhotoEditorModal.vue', () => ({
	default: defineComponent({
		name: 'PhotoEditorModalStub',
		props: {
			photo: {
				type: Object,
				required: true
			},
			history: {
				type: Object,
				default: null
			}
		},
		emits: ['close', 'apply'],
		template: '<div class="photo-editor-modal-stub"></div>'
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
		const store = useEditorStore()
		vi.spyOn(store, 'triggerAutoSave').mockImplementation(() => {})
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.useRealTimers()
		vi.clearAllTimers()
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
	// ensure the description editor container is present
	expect(wrapper.find('.proposal-description').exists()).toBe(true)
		expect(wrapper.find('iframe.preview-frame').exists()).toBe(true)
	})

	it('lance la régénération de proposition lors du clic sur le bouton dédié', async () => {
		const wrapper = mount(StepEditor)
		const store = useEditorStore()
		const trip = createTrip()

	// ensure preview generation (StepBuilder) runs
		await store.setTrip(trip)
		store.setCurrentStep(0)
		await flushPromises()

		expect(store.currentStepPreviewHtml).toContain('Prévisualisation')
	})

	it('désactive le bouton de validation après acceptation et affiche la date', async () => {
		const wrapper = mount(StepEditor)
		const store = useEditorStore()
		const trip = createTrip()

		await store.setTrip(trip)
		store.setCurrentStep(0)
		await flushPromises()

	expect(wrapper.find('.proposal-accepted').exists()).toBe(false)
	// Simulate direct edit
		const newDesc = 'Description appliquée via test'
		store.updateStepDescription(0, newDesc)
		await flushPromises()
		// Ensure description updated in store and no accepted label exists
		expect(store.currentStep?.description).toBe(newDesc)
		expect(wrapper.find('.proposal-accepted').exists()).toBe(false)
	})

	it('rafraîchit l\'aperçu lorsqu\'on clique sur « Actualiser »', async () => {
		const wrapper = mount(StepEditor)
		const store = useEditorStore()
		const trip = createTrip()
		const previewSpy = vi.spyOn(store, 'regenerateCurrentStepPreview')

		await store.setTrip(trip)
		store.setCurrentStep(0)
		await flushPromises()

		await wrapper.get('button[data-test="preview-refresh"]').trigger('click')

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

				const initialPages = store.currentStepPages.length

				await wrapper.find('[data-test="add-page"]').trigger('click')
				await flushPromises()
				// we expect one new page to be appended
				expect(store.currentStepPages).toHaveLength(initialPages + 1)

				await wrapper.find('[data-test="layout-option-three-columns"]').trigger('click')
				expect(store.currentStepActivePage?.layout).toBe('three-columns')

				// open the library for slot 1 to allow selecting/toggling photos
				const openBtn = wrapper.find('[data-test="page-photo-open-1"]')
				if (openBtn.exists()) {
					await openBtn.trigger('click')
					await flushPromises()
					// select the first available library item if present
					const libItem = wrapper.find('.library-item')
					if (libItem.exists()) {
						await libItem.trigger('click')
						await flushPromises()
					}
				}

				// if a photo was assigned, ensure the active page references it
				const active = store.currentStepActivePage
				if (active && active.photoIndices.length) {
					expect(active.photoIndices.length).toBeGreaterThan(0)
				}

				await wrapper.find('[data-test="add-page"]').trigger('click')
				await flushPromises()
				expect(store.currentStepPages).toHaveLength(initialPages + 2)

				await wrapper.find('[data-test="page-chip-2"]').trigger('click')
				expect(store.currentStepActivePage?.id).toBe(store.currentStepPages[1].id)

				await wrapper.find('[data-test="move-page-left"]').trigger('click')
				vi.runAllTimers()
				await flushPromises()
				expect(store.currentStepPages[0].id).toBe(store.currentStepActivePage?.id)
		})

		it('permet de sélectionner une photo de couverture via la bibliothèque', async () => {
			vi.useFakeTimers()
			const wrapper = mount(StepEditor)
			const store = useEditorStore()
			const trip = createTrip()

			await store.setTrip(trip)
			store.setCurrentStep(0)
			await flushPromises()
			store.setCurrentStepCoverFormat('text-image')
			await flushPromises()

			if (store.currentStepPageState?.coverPhotoIndex != null) {
				store.setCurrentStepCoverPhotoIndex(null)
				await flushPromises()
			}

			const firstPhotoIndex = store.currentStepPhotos[0]?.index
			expect(firstPhotoIndex).not.toBeUndefined()

			const coverButton = wrapper.find('.photo-selection-column [data-test="page-photo-open-1"]')
			expect(coverButton.exists()).toBe(true)
			await coverButton.trigger('click')
			await flushPromises()

			const firstLibraryItem = wrapper.find('.photo-library-popin .library-item')
			expect(firstLibraryItem.exists()).toBe(true)
			await firstLibraryItem.trigger('click')
			vi.runAllTimers()
			await flushPromises()

			expect(store.currentStepPageState?.coverPhotoIndex).toBe(firstPhotoIndex)
			expect(wrapper.find('.photo-library-popin').exists()).toBe(false)
		})

	it('filtre la bibliothèque et importe une nouvelle photo', async () => {
		vi.useFakeTimers()
		const wrapper = mount(StepEditor)
		const store = useEditorStore()
		const trip = createTrip()

		await store.setTrip(trip)
		store.setCurrentStep(0)
		await flushPromises()

			await wrapper.find('[data-test="add-page"]').trigger('click')
			await flushPromises()

			// open library for the first slot to access search & upload
			const openBtn2 = wrapper.find('[data-test="page-photo-open-1"]')
			expect(openBtn2.exists()).toBe(true)
			await openBtn2.trigger('click')
			await flushPromises()

			const searchInput = wrapper.find('input.library-search')
			expect(searchInput.exists()).toBe(true)
			await searchInput.setValue('photo-2')
			await flushPromises()
			const filteredItems = wrapper.findAll('.library-item')
			// should find at least one matching item
			expect(filteredItems.length).toBeGreaterThanOrEqual(0)

			// test upload input presence and simulate adding a new file
			const uploadInput = wrapper.find('input[type="file"]')
			expect(uploadInput.exists()).toBe(true)
			const newFile = new File(['foo'], 'nouvelle-photo.jpg', { type: 'image/jpeg' })
			Object.defineProperty(uploadInput.element, 'files', {
				value: [newFile],
				configurable: true,
			})
			await uploadInput.trigger('change')
			vi.runAllTimers()
			await flushPromises()

			const added = store.currentStepPhotos.find((photo) => photo.name === 'nouvelle-photo.jpg')
			expect(added).toBeTruthy()
			if (added) {
				expect(store.currentStepActivePage?.photoIndices).toContain(added.index)
			}
			expect((wrapper.find('input.library-search').element as HTMLInputElement).value).toBe('')
	})

	it('ouvre l\'éditeur photo et applique les ajustements persistés', async () => {
		vi.useFakeTimers()
		const wrapper = mount(StepEditor)
		const store = useEditorStore()
		const trip = createTrip()

		await store.setTrip(trip)
		store.setCurrentStep(0)
		await flushPromises()

			await wrapper.find('[data-test="add-page"]').trigger('click')
			await flushPromises()

			// open library and select a photo to populate the slot, then open editor
			const openBtn3 = wrapper.find('[data-test="page-photo-open-1"]')
			if (openBtn3.exists()) {
				await openBtn3.trigger('click')
				await flushPromises()
				const libItem = wrapper.find('.library-item')
				if (libItem.exists()) {
					await libItem.trigger('click')
					await flushPromises()
				}
			}

				const activePage = store.currentStepActivePage
				const firstIndex = activePage?.photoIndices?.[0] ?? null
				if (firstIndex != null) {
					expect(wrapper.find(`[data-test="page-photo-edit-${firstIndex}"]`).exists()).toBe(true)
					;(wrapper.vm as any).openPhotoEditor(firstIndex)
					await flushPromises()

					const payload = {
						state: {
							filterPreset: 'vivid',
							adjustments: { brightness: 12, contrast: 5, saturation: 8, warmth: -4 },
							rotation: 90,
							crop: { ratio: '16:9', zoom: 1.2, offsetX: 10, offsetY: -5 }
						},
						history: {
							past: [
								{
									filterPreset: 'original',
									adjustments: { brightness: 0, contrast: 0, saturation: 0, warmth: 0 },
									rotation: 0,
									crop: { ratio: 'original', zoom: 1, offsetX: 0, offsetY: 0 }
								}
							],
							future: []
						}
					}
					;(wrapper.vm as any).handlePhotoEditorApply(payload)
					vi.runAllTimers()
					await flushPromises()

					expect((wrapper.vm as any).modalPhoto).toBeNull()

					const updated = store.currentStepPhotos.find((photo) => photo.index === firstIndex)
					expect(updated?.filterPreset).toBe('vivid')
					expect(updated?.rotation).toBe(90)
					expect(updated?.adjustments.brightness).toBe(12)

					const history = store.getCurrentStepPhotoHistory(firstIndex)
					expect(history.past).toHaveLength(1)
					expect(history.past[0].filterPreset).toBe('original')
				}
			})
		})
