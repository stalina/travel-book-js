import type { DraftSnapshot, DraftInfo, DraftPhotoEntry } from '../models/draft.types'
import type { EditorStepPhoto, StepPageState } from '../models/editor.types'
import type { Trip } from '../models/types'
import { LoggerService } from './logger.service'

const DB_NAME = 'travel-book-drafts'
const DB_VERSION = 1
const STORE_META = 'draft-meta'
const STORE_PHOTOS = 'draft-photos'
const DRAFT_KEY = 'current'

/**
 * Service de persistance de brouillon dans IndexedDB.
 *
 * Stocke le snapshot JSON de l'état éditeur dans un object store "draft-meta"
 * et les blobs de photos dans un object store "draft-photos" (clé = photo id).
 *
 * Pattern Singleton — une seule instance partagée dans toute l'application.
 */
export class DraftStorageService {
  private static instance: DraftStorageService | null = null
  private readonly logger = LoggerService.getInstance()
  private db: IDBDatabase | null = null

  private constructor() {}

  /**
   * Obtient l'instance unique du DraftStorageService.
   */
  public static getInstance(): DraftStorageService {
    if (!DraftStorageService.instance) {
      DraftStorageService.instance = new DraftStorageService()
    }
    return DraftStorageService.instance
  }

  /**
   * Réinitialise l'instance singleton (utile pour les tests).
   */
  public static resetInstance(): void {
    if (DraftStorageService.instance?.db) {
      DraftStorageService.instance.db.close()
      DraftStorageService.instance.db = null
    }
    DraftStorageService.instance = null
  }

  // ---------------------------------------------------------------------------
  // Internal: IndexedDB helpers
  // ---------------------------------------------------------------------------

  private async openDb(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META)
        }
        if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
          db.createObjectStore(STORE_PHOTOS)
        }
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onerror = () => {
        this.logger.error('DraftStorageService', 'Failed to open IndexedDB', request.error)
        reject(request.error)
      }
    })
  }

  private async tx(
    storeNames: string | string[],
    mode: IDBTransactionMode
  ): Promise<IDBTransaction> {
    const db = await this.openDb()
    return db.transaction(storeNames, mode)
  }

  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  private promisifyTransaction(transaction: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error ?? new Error('Transaction aborted'))
    })
  }

  // ---------------------------------------------------------------------------
  // Serialization helpers
  // ---------------------------------------------------------------------------

  /**
   * Convertit les EditorStepPhoto[] en métadonnées sérialisables (sans File ni blob URL).
   */
  private serializePhotos(photos: EditorStepPhoto[]): DraftPhotoEntry[] {
    return photos.map((p) => ({
      id: p.id,
      index: p.index,
      name: p.name,
      ratio: p.ratio,
      width: p.width,
      height: p.height,
      orientation: p.orientation,
      fileSize: p.fileSize,
      filterPreset: p.filterPreset,
      adjustments: { ...p.adjustments },
      rotation: p.rotation,
      crop: { ...p.crop }
    }))
  }

  /**
   * Crée un snapshot sérialisable depuis l'état éditeur courant.
   */
  public buildSnapshot(
    trip: Trip,
    currentStepIndex: number,
    stepPhotosByStep: Record<number, EditorStepPhoto[]>,
    stepPageStates: Record<number, StepPageState | undefined>
  ): DraftSnapshot {
    const serializedPhotos: Record<number, DraftPhotoEntry[]> = {}
    for (const [stepId, photos] of Object.entries(stepPhotosByStep)) {
      serializedPhotos[Number(stepId)] = this.serializePhotos(photos)
    }

    const serializedPages: Record<number, StepPageState> = {}
    for (const [stepId, state] of Object.entries(stepPageStates)) {
      if (state) {
        serializedPages[Number(stepId)] = JSON.parse(JSON.stringify(state)) as StepPageState
      }
    }

    return {
      version: 1,
      savedAt: Date.now(),
      trip: JSON.parse(JSON.stringify(trip)) as Trip,
      currentStepIndex,
      stepPhotosByStep: serializedPhotos,
      stepPageStates: serializedPages
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Sauvegarde le brouillon complet : snapshot JSON + blobs des photos.
   */
  public async saveDraft(
    trip: Trip,
    currentStepIndex: number,
    stepPhotosByStep: Record<number, EditorStepPhoto[]>,
    stepPageStates: Record<number, StepPageState | undefined>
  ): Promise<void> {
    this.logger.info('DraftStorageService', 'Saving draft…')

    const snapshot = this.buildSnapshot(trip, currentStepIndex, stepPhotosByStep, stepPageStates)

    // Collect all photo blobs for storage
    const photoBlobs: Array<{ key: string; blob: Blob }> = []
    for (const [stepId, photos] of Object.entries(stepPhotosByStep)) {
      for (const photo of photos) {
        if (photo.file) {
          photoBlobs.push({ key: `${stepId}-${photo.index}`, blob: photo.file })
        }
      }
    }

    // Write everything in a single transaction when possible
    const transaction = await this.tx([STORE_META, STORE_PHOTOS], 'readwrite')
    const metaStore = transaction.objectStore(STORE_META)
    const photoStore = transaction.objectStore(STORE_PHOTOS)

    // Clear previous photo blobs
    photoStore.clear()

    // Store snapshot
    metaStore.put(snapshot, DRAFT_KEY)

    // Store each photo blob
    for (const entry of photoBlobs) {
      photoStore.put(entry.blob, entry.key)
    }

    await this.promisifyTransaction(transaction)
    this.logger.info('DraftStorageService', `Draft saved (${photoBlobs.length} photos)`)
  }

  /**
   * Vérifie si un brouillon existe dans IndexedDB.
   */
  public async hasDraft(): Promise<boolean> {
    try {
      const transaction = await this.tx(STORE_META, 'readonly')
      const store = transaction.objectStore(STORE_META)
      const result = await this.promisifyRequest(store.get(DRAFT_KEY))
      return result != null
    } catch {
      return false
    }
  }

  /**
   * Retourne les métadonnées résumées du brouillon (pour affichage), ou null s'il n'existe pas.
   */
  public async getDraftInfo(): Promise<DraftInfo | null> {
    try {
      const transaction = await this.tx(STORE_META, 'readonly')
      const store = transaction.objectStore(STORE_META)
      const snapshot = (await this.promisifyRequest(store.get(DRAFT_KEY))) as DraftSnapshot | undefined

      if (!snapshot) return null

      let totalPhotos = 0
      for (const photos of Object.values(snapshot.stepPhotosByStep)) {
        totalPhotos += photos.length
      }

      return {
        tripName: snapshot.trip.name,
        savedAt: snapshot.savedAt,
        totalSteps: snapshot.trip.steps.length,
        totalPhotos
      }
    } catch {
      return null
    }
  }

  /**
   * Charge le brouillon complet : snapshot + blobs des photos.
   * Retourne null si aucun brouillon n'existe.
   */
  public async loadDraft(): Promise<{
    snapshot: DraftSnapshot
    photoBlobs: Record<string, Blob>
  } | null> {
    try {
      const transaction = await this.tx([STORE_META, STORE_PHOTOS], 'readonly')
      const metaStore = transaction.objectStore(STORE_META)
      const photoStore = transaction.objectStore(STORE_PHOTOS)

      const snapshot = (await this.promisifyRequest(metaStore.get(DRAFT_KEY))) as DraftSnapshot | undefined
      if (!snapshot) return null

      // Load all photo blobs
      const photoBlobs: Record<string, Blob> = {}
      const cursorRequest = photoStore.openCursor()

      await new Promise<void>((resolve, reject) => {
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result
          if (cursor) {
            photoBlobs[cursor.key as string] = cursor.value as Blob
            cursor.continue()
          } else {
            resolve()
          }
        }
        cursorRequest.onerror = () => reject(cursorRequest.error)
      })

      this.logger.info('DraftStorageService', `Draft loaded (${Object.keys(photoBlobs).length} photos)`)
      return { snapshot, photoBlobs }
    } catch (err) {
      this.logger.error('DraftStorageService', 'Failed to load draft', err)
      return null
    }
  }

  /**
   * Supprime le brouillon et tous les blobs de photos associés.
   */
  public async deleteDraft(): Promise<void> {
    try {
      const transaction = await this.tx([STORE_META, STORE_PHOTOS], 'readwrite')
      transaction.objectStore(STORE_META).delete(DRAFT_KEY)
      transaction.objectStore(STORE_PHOTOS).clear()
      await this.promisifyTransaction(transaction)
      this.logger.info('DraftStorageService', 'Draft deleted')
    } catch (err) {
      this.logger.error('DraftStorageService', 'Failed to delete draft', err)
    }
  }
}

export const draftStorageService = DraftStorageService.getInstance()
