import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import AlbumImportPanel from '../src/components/album/AlbumImportPanel.vue'
import { usePolarstepsImport } from '../src/composables/usePolarstepsImport'

// Mock du composable
vi.mock('../src/composables/usePolarstepsImport', () => ({
  usePolarstepsImport: vi.fn()
}))

describe('AlbumImportPanel', () => {
  const mockSelectDirectory = vi.fn()
  const mockOnDrop = vi.fn()
  const mockOnDragOver = vi.fn()
  const mockOnFilesPicked = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le message initial en phase idle', () => {
    vi.mocked(usePolarstepsImport).mockReturnValue({
      phase: ref('idle'),
      error: ref(null),
      files: ref([]),
      photosPreview: ref([]),
      tripJsonFound: ref(false),
      canImport: computed(() => false),
      selectDirectory: mockSelectDirectory,
      onDrop: mockOnDrop,
      onDragOver: mockOnDragOver,
      fileInput: ref(null),
      onFilesPicked: mockOnFilesPicked
    })

    const wrapper = mount(AlbumImportPanel)
    expect(wrapper.text()).toContain('Déposez le dossier ici ou')
  })

  it('affiche message de scanning pendant analyse', () => {
    vi.mocked(usePolarstepsImport).mockReturnValue({
      phase: ref('scanning'),
      error: ref(null),
      files: ref([]),
      photosPreview: ref([]),
      tripJsonFound: ref(false),
      canImport: computed(() => false),
      selectDirectory: mockSelectDirectory,
      onDrop: mockOnDrop,
      onDragOver: mockOnDragOver,
      fileInput: ref(null),
      onFilesPicked: mockOnFilesPicked
    })

    const wrapper = mount(AlbumImportPanel)
    expect(wrapper.text()).toContain('Analyse des fichiers…')
  })

  it('affiche message de parsing pendant traitement', () => {
    vi.mocked(usePolarstepsImport).mockReturnValue({
      phase: ref('parsing'),
      error: ref(null),
      files: ref([]),
      photosPreview: ref([]),
      tripJsonFound: ref(false),
      canImport: computed(() => false),
      selectDirectory: mockSelectDirectory,
      onDrop: mockOnDrop,
      onDragOver: mockOnDragOver,
      fileInput: ref(null),
      onFilesPicked: mockOnFilesPicked
    })

    const wrapper = mount(AlbumImportPanel)
    expect(wrapper.text()).toContain('Parsing du voyage…')
  })

  it('affiche succès et bouton actif en phase ready', () => {
    vi.mocked(usePolarstepsImport).mockReturnValue({
      phase: ref('ready'),
      error: ref(null),
      files: ref([]),
      photosPreview: ref([]),
      tripJsonFound: ref(true),
      canImport: computed(() => true),
      selectDirectory: mockSelectDirectory,
      onDrop: mockOnDrop,
      onDragOver: mockOnDragOver,
      fileInput: ref(null),
      onFilesPicked: mockOnFilesPicked
    })

    const wrapper = mount(AlbumImportPanel)
    expect(wrapper.text()).toContain('Dossier prêt ✔')
    
    const button = wrapper.find('button.base-button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('affiche le bouton désactivé quand canImport est false', () => {
    vi.mocked(usePolarstepsImport).mockReturnValue({
      phase: ref('idle'),
      error: ref(null),
      files: ref([]),
      photosPreview: ref([]),
      tripJsonFound: ref(false),
      canImport: computed(() => false),
      selectDirectory: mockSelectDirectory,
      onDrop: mockOnDrop,
      onDragOver: mockOnDragOver,
      fileInput: ref(null),
      onFilesPicked: mockOnFilesPicked
    })

    const wrapper = mount(AlbumImportPanel)
    const button = wrapper.find('button.base-button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('déclenche onImportReady au clic sur Continuer quand ready', async () => {
    const onImportReadyMock = vi.fn()
    
    vi.mocked(usePolarstepsImport).mockReturnValue({
      phase: ref('ready'),
      error: ref(null),
      files: ref([]),
      photosPreview: ref([]),
      tripJsonFound: ref(true),
      canImport: computed(() => true),
      selectDirectory: mockSelectDirectory,
      onDrop: mockOnDrop,
      onDragOver: mockOnDragOver,
      fileInput: ref(null),
      onFilesPicked: mockOnFilesPicked
    })

    const wrapper = mount(AlbumImportPanel, {
      props: {
        onImportReady: onImportReadyMock
      }
    })

    const button = wrapper.find('button.base-button')
    await button.trigger('click')
    
    expect(onImportReadyMock).toHaveBeenCalledTimes(1)
  })

  it('ne déclenche pas onImportReady si canImport est false', async () => {
    const onImportReadyMock = vi.fn()
    
    vi.mocked(usePolarstepsImport).mockReturnValue({
      phase: ref('scanning'),
      error: ref(null),
      files: ref([]),
      photosPreview: ref([]),
      tripJsonFound: ref(false),
      canImport: computed(() => false),
      selectDirectory: mockSelectDirectory,
      onDrop: mockOnDrop,
      onDragOver: mockOnDragOver,
      fileInput: ref(null),
      onFilesPicked: mockOnFilesPicked
    })

    const wrapper = mount(AlbumImportPanel, {
      props: {
        onImportReady: onImportReadyMock
      }
    })

    // Le bouton est désactivé, le clic ne devrait rien déclencher
    const button = wrapper.find('button.base-button')
    await button.trigger('click')
    
    expect(onImportReadyMock).not.toHaveBeenCalled()
  })

  it('affiche erreur en phase error', () => {
    vi.mocked(usePolarstepsImport).mockReturnValue({
      phase: ref('error'),
      error: ref('Fichier trip.json introuvable'),
      files: ref([]),
      photosPreview: ref([]),
      tripJsonFound: ref(false),
      canImport: computed(() => false),
      selectDirectory: mockSelectDirectory,
      onDrop: mockOnDrop,
      onDragOver: mockOnDragOver,
      fileInput: ref(null),
      onFilesPicked: mockOnFilesPicked
    })

    const wrapper = mount(AlbumImportPanel)
    expect(wrapper.text()).toContain('Erreur: Fichier trip.json introuvable')
  })

  it('affiche fallback en phase fallback', () => {
    vi.mocked(usePolarstepsImport).mockReturnValue({
      phase: ref('fallback'),
      error: ref(null),
      files: ref([]),
      photosPreview: ref([]),
      tripJsonFound: ref(false),
      canImport: computed(() => false),
      selectDirectory: mockSelectDirectory,
      onDrop: mockOnDrop,
      onDragOver: mockOnDragOver,
      fileInput: ref(null),
      onFilesPicked: mockOnFilesPicked
    })

    const wrapper = mount(AlbumImportPanel)
    expect(wrapper.text()).toContain('API de dossier indisponible')
  })

  it('affiche les prévisualisations quand photosPreview est rempli', () => {
    const mockPreviews = [
      'blob:http://localhost/preview1',
      'blob:http://localhost/preview2',
      'blob:http://localhost/preview3'
    ]

    vi.mocked(usePolarstepsImport).mockReturnValue({
      phase: ref('ready'),
      error: ref(null),
      files: ref([]),
      photosPreview: ref(mockPreviews),
      tripJsonFound: ref(true),
      canImport: computed(() => true),
      selectDirectory: mockSelectDirectory,
      onDrop: mockOnDrop,
      onDragOver: mockOnDragOver,
      fileInput: ref(null),
      onFilesPicked: mockOnFilesPicked
    })

    const wrapper = mount(AlbumImportPanel)
    expect(wrapper.text()).toContain('Prévisualisation')
    
    const images = wrapper.findAll('.grid img')
    expect(images).toHaveLength(3)
    expect(images[0].attributes('src')).toBe(mockPreviews[0])
  })

  it('ne affiche pas de prévisualisations si le tableau est vide', () => {
    vi.mocked(usePolarstepsImport).mockReturnValue({
      phase: ref('ready'),
      error: ref(null),
      files: ref([]),
      photosPreview: ref([]),
      tripJsonFound: ref(true),
      canImport: computed(() => true),
      selectDirectory: mockSelectDirectory,
      onDrop: mockOnDrop,
      onDragOver: mockOnDragOver,
      fileInput: ref(null),
      onFilesPicked: mockOnFilesPicked
    })

    const wrapper = mount(AlbumImportPanel)
    expect(wrapper.text()).not.toContain('Prévisualisation')
  })

  it('appelle selectDirectory au clic sur parcourir', async () => {
    vi.mocked(usePolarstepsImport).mockReturnValue({
      phase: ref('idle'),
      error: ref(null),
      files: ref([]),
      photosPreview: ref([]),
      tripJsonFound: ref(false),
      canImport: computed(() => false),
      selectDirectory: mockSelectDirectory,
      onDrop: mockOnDrop,
      onDragOver: mockOnDragOver,
      fileInput: ref(null),
      onFilesPicked: mockOnFilesPicked
    })

    const wrapper = mount(AlbumImportPanel)
    const browseButton = wrapper.find('button.link')
    await browseButton.trigger('click')
    
    expect(mockSelectDirectory).toHaveBeenCalledTimes(1)
  })

  it('contient un input hidden avec webkitdirectory pour fallback', () => {
    vi.mocked(usePolarstepsImport).mockReturnValue({
      phase: ref('fallback'),
      error: ref(null),
      files: ref([]),
      photosPreview: ref([]),
      tripJsonFound: ref(false),
      canImport: computed(() => false),
      selectDirectory: mockSelectDirectory,
      onDrop: mockOnDrop,
      onDragOver: mockOnDragOver,
      fileInput: ref(null),
      onFilesPicked: mockOnFilesPicked
    })

    const wrapper = mount(AlbumImportPanel)
    const input = wrapper.find('input[type="file"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('webkitdirectory')).toBeDefined()
    expect(input.attributes('multiple')).toBeDefined()
  })
})
