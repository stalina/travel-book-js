import { defineStore } from 'pinia'
import { readTripDirectory, FFInput } from '../services/fs.service'
import { parseTrip } from '../services/parse.service'
import { generateArtifacts, GeneratedArtifacts, GenerateOptions } from '../services/generate.service'

export const useTripStore = defineStore('trip', {
  state: () => ({
    input: null as FFInput | null,
  artifacts: null as GeneratedArtifacts | null,
  photosPlanText: '' as string
  }),
  getters: {
    hasInput: (s) => !!s.input
  },
  actions: {
    async pickDirectory() {
      const inp = await readTripDirectory()
      this.input = inp
    },
    setFiles(files: FileList) {
      this.input = { kind: 'files', files: Array.from(files) }
    },
    async handleDropItems(items: DataTransferItemList) {
      const entry = items[0] && (items[0].webkitGetAsEntry?.() as any)
      // Minimal: fall back to files
      const files: File[] = []
      for (const it of Array.from(items)) {
        const f = it.getAsFile()
        if (f) files.push(f)
      }
      if (files.length) this.input = { kind: 'files', files }
    },
    async startGeneration() {
      location.hash = '#/generate'
    },
    async readInput() {
      if (!this.input) throw new Error('Aucun input')
      // No-op here, fs.service handles reading on parse
    },
    async parseAndMap() {
      if (!this.input) throw new Error('Aucun input')
      await parseTrip(this.input)
    },
    async generateArtifacts(options?: GenerateOptions) {
      if (!this.input) throw new Error('Aucun input')
      this.artifacts = await generateArtifacts(this.input, options)
    },
    async ensureDraftPlan() {
      if (!this.input) throw new Error('Aucun input')
      if (this.photosPlanText && this.photosPlanText.trim().length > 0) return
      // Génère une première fois pour récupérer le plan par défaut, puis on l'expose pour édition
      const artifacts = await generateArtifacts(this.input)
      const plan = artifacts.manifest['photos_by_pages.txt']
      if (plan) {
        this.photosPlanText = await plan.text()
      }
      // On invalide les artefacts pour forcer une vraie génération après édition
      this.artifacts = null
    },
    async finalizeWithPlanAndOpenViewer() {
      if (!this.input) throw new Error('Aucun input')
      const txt = this.photosPlanText ?? ''
      this.artifacts = await generateArtifacts(this.input, { photosPlan: txt })
      location.hash = '#/viewer'
    },
    async openViewer() {
      if (!this.artifacts) throw new Error('Pas d\'artefacts')
      // Mode intégré: on navigue vers la vue Viewer qui utilise iframe srcdoc
      location.hash = '#/viewer'
      return ''
    }
  }
})
