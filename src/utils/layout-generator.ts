import type { PhotoRatio, StepPageLayout } from '../models/editor.types'

/**
 * Photo minimale requise pour la génération de layout
 */
export interface LayoutPhoto {
  index: number
  ratio: PhotoRatio
}

/**
 * Page générée avec son layout et les indices des photos
 */
export interface GeneratedPage {
  layout: StepPageLayout
  photoIndices: number[]
}

/**
 * Génère automatiquement les pages optimales en fonction des ratios des photos
 * 
 * Algorithme identique à celui utilisé dans StepBuilder pour garantir
 * que l'éditeur propose les mêmes layouts que le PDF généré.
 * 
 * @param photos - Liste des photos avec leur ratio
 * @param coverPhotoIndex - Index de la photo de couverture (à exclure)
 * @returns Liste des pages générées avec leurs layouts
 */
export function generateAutomaticPages(
  photos: LayoutPhoto[],
  coverPhotoIndex: number | null = null
): GeneratedPage[] {
  // Séparer les photos par ratio (en excluant la couverture)
  const portraits = photos.filter(
    (photo) => photo.ratio === 'PORTRAIT' && photo.index !== coverPhotoIndex
  )
  const landscapes = photos.filter(
    (photo) => photo.ratio === 'LANDSCAPE' && photo.index !== coverPhotoIndex
  )
  const others = photos.filter(
    (photo) => photo.ratio === 'UNKNOWN' && photo.index !== coverPhotoIndex
  )

  const pages: GeneratedPage[] = []
  
  const pushPage = (layout: StepPageLayout, photoList: LayoutPhoto[]) => {
    if (!photoList.length) return
    pages.push({
      layout,
      photoIndices: photoList.map((p) => p.index)
    })
  }

  // Grilles 2x2 avec 4 paysages
  while (landscapes.length >= 4) {
    pushPage('grid-2x2', landscapes.splice(0, 4))
  }

  // Hero + 2 avec 2 paysages et 1 portrait
  while (landscapes.length >= 2 && portraits.length >= 1) {
    pushPage('hero-plus-2', [landscapes.shift()!, landscapes.shift()!, portraits.shift()!])
  }

  // Trois colonnes avec 3 portraits
  while (portraits.length >= 3) {
    pushPage('three-columns', portraits.splice(0, 3))
  }

  // Hero + 2 avec 2 portraits
  while (portraits.length >= 2) {
    pushPage('hero-plus-2', portraits.splice(0, 2))
  }

  // Hero + 2 avec 2 paysages restants
  while (landscapes.length >= 2) {
    pushPage('hero-plus-2', landscapes.splice(0, 2))
  }

  // Pleine page pour portrait unique
  if (portraits.length === 1) {
    pushPage('full-page', portraits.splice(0, 1))
  }

  // Pleine page pour paysage unique
  if (landscapes.length === 1) {
    pushPage('full-page', landscapes.splice(0, 1))
  }

  // Pleine page pour toutes les photos unknown
  while (others.length) {
    pushPage('full-page', [others.shift()!])
  }

  return pages
}

/**
 * Infère le layout optimal en fonction du nombre de photos
 * 
 * @param count - Nombre de photos
 * @returns Layout suggéré
 */
export function inferLayoutFromCount(count: number): StepPageLayout {
  if (count >= 4) return 'grid-2x2'
  if (count === 3) return 'three-columns'
  if (count === 2) return 'hero-plus-2'
  return 'full-page'
}
