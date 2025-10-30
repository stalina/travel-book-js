import { loggerService } from './logger.service'

export type FFInput =
  | { kind: 'fs'; dirHandle: FileSystemDirectoryHandle }
  | { kind: 'files'; files: File[] }

/**
 * Service de gestion du système de fichiers
 * Fournit des méthodes pour lire des fichiers et dossiers via File System Access API ou input file
 */
export class FileSystemService {
  private static instance: FileSystemService

  /**
   * Constructeur privé pour forcer l'utilisation du pattern Singleton
   */
  private constructor() {}

  /**
   * Obtient l'instance unique du FileSystemService
   * @returns L'instance singleton de FileSystemService
   */
  public static getInstance(): FileSystemService {
    if (!FileSystemService.instance) {
      FileSystemService.instance = new FileSystemService()
    }
    return FileSystemService.instance
  }

  /**
   * Ouvre le sélecteur de dossier et retourne le handle
   * Utilise File System Access API si disponible, sinon lance une erreur
   * @returns FFInput avec le handle du dossier
   * @throws Error si File System Access API n'est pas disponible
   */
  public async readTripDirectory(): Promise<FFInput> {
    if ('showDirectoryPicker' in window) {
      loggerService.debug('FileSystemService', 'Ouverture du sélecteur de dossier')
      const dirHandle = await (window as any).showDirectoryPicker()
      loggerService.debug('FileSystemService', 'Dossier sélectionné', { name: dirHandle.name })
      return { kind: 'fs', dirHandle }
    }
    loggerService.error('FileSystemService', 'File System Access API non disponible')
    throw new Error('File System Access API non disponible. Utilisez la sélection de fichiers.')
  }

  /**
   * Lit un fichier à partir d'un chemin relatif
   * @param input - Source des fichiers (File System Access API ou liste de fichiers)
   * @param pathParts - Parties du chemin relatif (ex: ['step1', 'photos', 'IMG_001.jpg'])
   * @returns Le fichier trouvé ou null
   */
  public async readFileFromPath(input: FFInput, pathParts: string[]): Promise<File | null> {
    const path = pathParts.join('/')
    loggerService.debug('FileSystemService', `Lecture du fichier: ${path}`)
    
    try {
      if (input.kind === 'fs') {
        let handle: FileSystemHandle = input.dirHandle
        for (const part of pathParts) {
          // @ts-ignore
          handle = await (handle as any).getDirectoryHandle?.(part) ?? await (handle as any).getFileHandle?.(part)
        }
        // @ts-ignore
        const file = await (handle as any).getFile?.()
        if (file) {
          loggerService.debug('FileSystemService', `Fichier trouvé: ${path}`, { size: file.size })
        }
        return file ?? null
      } else {
        const rel = pathParts.join('/')
        const file = input.files.find(f => f.webkitRelativePath.endsWith(rel) || f.name === pathParts[pathParts.length-1])
        if (file) {
          loggerService.debug('FileSystemService', `Fichier trouvé: ${path}`, { size: file.size })
        } else {
          loggerService.debug('FileSystemService', `Fichier non trouvé: ${path}`)
        }
        return file ?? null
      }
    } catch (error) {
      loggerService.warn('FileSystemService', `Erreur lors de la lecture de ${path}`, error)
      return null
    }
  }

  /**
   * Lit toutes les photos d'une étape
   * @param input - Source des fichiers (File System Access API ou liste de fichiers)
   * @param stepSlug - Slug de l'étape
   * @param stepId - ID de l'étape
   * @returns Liste des fichiers photos triés par nom
   */
  public async readAllPhotos(input: FFInput, stepSlug: string, stepId: number): Promise<File[]> {
    const dir = `${stepSlug}_${stepId}/photos/`
    loggerService.debug('FileSystemService', `Lecture des photos: ${dir}`)
    
    if (input.kind === 'fs') {
      const photos: File[] = []
      try {
        const stepDir = await input.dirHandle.getDirectoryHandle(dir, { create: false })
        for await (const entry of (stepDir as any).values()) {
          if (entry.kind === 'file') {
            const f = await entry.getFile()
            photos.push(f)
          }
        }
      } catch (error) {
        loggerService.debug('FileSystemService', `Dossier photos non trouvé: ${dir}`)
        // ignore - pas de photos pour cette étape
      }
      loggerService.debug('FileSystemService', `${photos.length} photos trouvées dans ${dir}`)
      return photos.sort((a,b)=> a.name.localeCompare(b.name))
    } else {
      const photos = input.files
        .filter(f => f.webkitRelativePath.includes(dir))
        .sort((a,b)=> a.name.localeCompare(b.name))
      loggerService.debug('FileSystemService', `${photos.length} photos trouvées dans ${dir}`)
      return photos
    }
  }
}

// Export singleton instance
export const fileSystemService = FileSystemService.getInstance()
