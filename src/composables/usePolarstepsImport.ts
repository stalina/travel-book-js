import { ref, computed } from 'vue'
import { useTripStore } from '../stores/trip.store'
import { tripParser } from '../services/parse.service'
import { fileSystemService, FFInput } from '../services/fs.service'
import { loggerService } from '../services/logger.service'

/**
 * Composable spécialisé pour l'import d'un dossier Polarsteps
 * Fournit :
 *  - zone drag & drop
 *  - sélection dossier (DirectoryPicker / input webkitdirectory)
 *  - inventaire fichiers + prévisualisation (photos)
 *  - progression (scan -> parse -> ready)
 *  - gestion erreurs
 */
export function usePolarstepsImport() {
  const store = useTripStore()
  const phase = ref<'idle' | 'scanning' | 'parsing' | 'ready' | 'error' | 'fallback'>('idle')
  const error = ref<string | null>(null)
  const fileInput = ref<HTMLInputElement | null>(null)
  const files = ref<File[]>([])
  const photosPreview = ref<string[]>([])
  const tripJsonFound = ref<boolean>(false)

  /** Sélection via picker directory */
  async function selectDirectory() {
    error.value = null
    if ('showDirectoryPicker' in window) {
      try {
        const input = await fileSystemService.readTripDirectory()
        await processInput(input)
      } catch (e: any) {
        // Si l'API échoue, on propose le fallback plutôt que rester en erreur
        error.value = e.message || 'Sélection du dossier impossible'
        phase.value = 'fallback'
        triggerFallback()
      }
    } else {
      phase.value = 'fallback'
      triggerFallback()
    }
  }

  function triggerFallback() {
    // Ouvre input si possible
    if (fileInput.value) {
      fileInput.value.click()
    }
  }

  function onFilesPicked(e: Event) {
    const inputEl = e.target as HTMLInputElement
    if (inputEl.files && inputEl.files.length) {
      const ff: FFInput = { kind: 'files', files: Array.from(inputEl.files) }
      processInput(ff)
    }
  }

  /** Drop direct dans la zone */
  async function onDrop(e: DragEvent) {
    e.preventDefault()
    const items = e.dataTransfer?.items
    if (!items) return
    const fileList: File[] = []
    for (const it of Array.from(items)) {
      const f = it.getAsFile()
      if (f) fileList.push(f)
    }
    if (fileList.length) {
      const input: FFInput = { kind: 'files', files: fileList }
      await processInput(input)
    }
  }

  function onDragOver(e: DragEvent) { e.preventDefault() }

  async function processInput(input: FFInput) {
    phase.value = 'scanning'
    store.input = input
    // Inventaire simple : si kind=files on prend tel quel, sinon on ne dispose pas encore d'API récursive portable -> on s'appuie sur parsing direct
    if (input.kind === 'files') {
      files.value = input.files.sort((a,b)=> a.webkitRelativePath.localeCompare(b.webkitRelativePath))
      tripJsonFound.value = input.files.some(f => f.name === 'trip.json' || f.webkitRelativePath.endsWith('/trip.json'))
    } else {
      // Pas de listing récursif standard sans permissions additionnelles : on laisse TripParser découvrir trip.json
      files.value = []
      tripJsonFound.value = true // on suppose présent, le parse validera
    }
    buildPreviews()
    await parse()
  }

  function buildPreviews() {
    // Limiter à 12 miniatures pour performance
    const photoFiles = files.value.filter(f => /\.(jpe?g|png|webp)$/i.test(f.name)).slice(0,12)
    photosPreview.value = photoFiles.map(f => URL.createObjectURL(f))
  }

  async function parse() {
    try {
      phase.value = 'parsing'
      await tripParser.parse(store.input!)
      phase.value = 'ready'
      loggerService.info('polarsteps-import', 'Import terminé')
    } catch (e: any) {
      error.value = e.message || 'Échec du parsing'
      phase.value = 'error'
    }
  }

  const canImport = computed(() => tripJsonFound.value && (phase.value === 'ready'))

  return {
    phase,
    error,
    files,
    photosPreview,
    tripJsonFound,
    canImport,
    selectDirectory,
    onDrop,
    onDragOver,
    fileInput,
    onFilesPicked
  }
}
