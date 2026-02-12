import { describe, it, expect } from 'vitest'
import { generateAutomaticPages, inferLayoutFromCount, type LayoutPhoto } from '../../src/utils/layout-generator'

describe('layout-generator', () => {
  describe('inferLayoutFromCount', () => {
    it('retourne grid-2x2 pour 4 photos ou plus', () => {
      expect(inferLayoutFromCount(4)).toBe('grid-2x2')
      expect(inferLayoutFromCount(5)).toBe('grid-2x2')
      expect(inferLayoutFromCount(10)).toBe('grid-2x2')
    })

    it('retourne three-columns pour 3 photos', () => {
      expect(inferLayoutFromCount(3)).toBe('three-columns')
    })

    it('retourne hero-plus-2 pour 2 photos', () => {
      expect(inferLayoutFromCount(2)).toBe('hero-plus-2')
    })

    it('retourne full-page pour 1 photo ou moins', () => {
      expect(inferLayoutFromCount(1)).toBe('full-page')
      expect(inferLayoutFromCount(0)).toBe('full-page')
    })
  })

  describe('generateAutomaticPages', () => {
    it('génère une grille 2x2 pour 4 paysages', () => {
      const photos: LayoutPhoto[] = [
        { index: 1, ratio: 'LANDSCAPE' },
        { index: 2, ratio: 'LANDSCAPE' },
        { index: 3, ratio: 'LANDSCAPE' },
        { index: 4, ratio: 'LANDSCAPE' }
      ]

      const pages = generateAutomaticPages(photos)

      expect(pages).toHaveLength(1)
      expect(pages[0].layout).toBe('grid-2x2')
      expect(pages[0].photoIndices).toEqual([1, 2, 3, 4])
    })

    it('génère hero-plus-2 pour 2 paysages et 1 portrait', () => {
      const photos: LayoutPhoto[] = [
        { index: 1, ratio: 'LANDSCAPE' },
        { index: 2, ratio: 'LANDSCAPE' },
        { index: 3, ratio: 'PORTRAIT' }
      ]

      const pages = generateAutomaticPages(photos)

      expect(pages).toHaveLength(1)
      expect(pages[0].layout).toBe('hero-plus-2')
      expect(pages[0].photoIndices).toEqual([1, 2, 3])
    })

    it('génère three-columns pour 3 portraits', () => {
      const photos: LayoutPhoto[] = [
        { index: 1, ratio: 'PORTRAIT' },
        { index: 2, ratio: 'PORTRAIT' },
        { index: 3, ratio: 'PORTRAIT' }
      ]

      const pages = generateAutomaticPages(photos)

      expect(pages).toHaveLength(1)
      expect(pages[0].layout).toBe('three-columns')
      expect(pages[0].photoIndices).toEqual([1, 2, 3])
    })

    it('génère hero-plus-2 pour 2 portraits', () => {
      const photos: LayoutPhoto[] = [
        { index: 1, ratio: 'PORTRAIT' },
        { index: 2, ratio: 'PORTRAIT' }
      ]

      const pages = generateAutomaticPages(photos)

      expect(pages).toHaveLength(1)
      expect(pages[0].layout).toBe('hero-plus-2')
      expect(pages[0].photoIndices).toEqual([1, 2])
    })

    it('génère full-page pour 1 portrait', () => {
      const photos: LayoutPhoto[] = [
        { index: 1, ratio: 'PORTRAIT' }
      ]

      const pages = generateAutomaticPages(photos)

      expect(pages).toHaveLength(1)
      expect(pages[0].layout).toBe('full-page')
      expect(pages[0].photoIndices).toEqual([1])
    })

    it('génère full-page pour 1 paysage', () => {
      const photos: LayoutPhoto[] = [
        { index: 1, ratio: 'LANDSCAPE' }
      ]

      const pages = generateAutomaticPages(photos)

      expect(pages).toHaveLength(1)
      expect(pages[0].layout).toBe('full-page')
      expect(pages[0].photoIndices).toEqual([1])
    })

    it('génère full-page pour chaque photo UNKNOWN', () => {
      const photos: LayoutPhoto[] = [
        { index: 1, ratio: 'UNKNOWN' },
        { index: 2, ratio: 'UNKNOWN' }
      ]

      const pages = generateAutomaticPages(photos)

      expect(pages).toHaveLength(2)
      expect(pages[0].layout).toBe('full-page')
      expect(pages[0].photoIndices).toEqual([1])
      expect(pages[1].layout).toBe('full-page')
      expect(pages[1].photoIndices).toEqual([2])
    })

    it('exclut la photo de couverture des pages générées', () => {
      const photos: LayoutPhoto[] = [
        { index: 1, ratio: 'LANDSCAPE' },
        { index: 2, ratio: 'LANDSCAPE' },
        { index: 3, ratio: 'LANDSCAPE' }
      ]

      const pages = generateAutomaticPages(photos, 1)

      expect(pages).toHaveLength(1)
      expect(pages[0].layout).toBe('hero-plus-2')
      expect(pages[0].photoIndices).toEqual([2, 3])
    })

    it('gère un mix complexe de photos', () => {
      // Scénario réaliste: 19 photos avec différents ratios
      const photos: LayoutPhoto[] = [
        { index: 1, ratio: 'LANDSCAPE' },
        { index: 2, ratio: 'LANDSCAPE' },
        { index: 3, ratio: 'LANDSCAPE' },
        { index: 4, ratio: 'LANDSCAPE' },
        { index: 5, ratio: 'LANDSCAPE' },
        { index: 6, ratio: 'LANDSCAPE' },
        { index: 7, ratio: 'LANDSCAPE' },
        { index: 8, ratio: 'LANDSCAPE' },
        { index: 9, ratio: 'PORTRAIT' },
        { index: 10, ratio: 'PORTRAIT' },
        { index: 11, ratio: 'PORTRAIT' },
        { index: 12, ratio: 'PORTRAIT' },
        { index: 13, ratio: 'PORTRAIT' },
        { index: 14, ratio: 'LANDSCAPE' },
        { index: 15, ratio: 'LANDSCAPE' },
        { index: 16, ratio: 'PORTRAIT' },
        { index: 17, ratio: 'PORTRAIT' },
        { index: 18, ratio: 'UNKNOWN' },
        { index: 19, ratio: 'LANDSCAPE' }
      ]

      const pages = generateAutomaticPages(photos, 1) // Photo 1 en couverture

      // Vérifier qu'on a optimisé les pages (pas 18 pages full-page)
      expect(pages.length).toBeLessThan(18)
      
      // Vérifier que toutes les photos (sauf couverture) sont présentes
      const allIndices = pages.flatMap(p => p.photoIndices).sort((a, b) => a - b)
      expect(allIndices).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
    })

    it('retourne un tableau vide pour aucune photo', () => {
      const pages = generateAutomaticPages([])
      expect(pages).toEqual([])
    })

    it('retourne un tableau vide si toutes les photos sont la couverture', () => {
      const photos: LayoutPhoto[] = [
        { index: 1, ratio: 'LANDSCAPE' }
      ]

      const pages = generateAutomaticPages(photos, 1)
      expect(pages).toEqual([])
    })

    it('optimise 8 paysages en 2 grilles 2x2', () => {
      const photos: LayoutPhoto[] = Array.from({ length: 8 }, (_, i) => ({
        index: i + 1,
        ratio: 'LANDSCAPE' as const
      }))

      const pages = generateAutomaticPages(photos)

      expect(pages).toHaveLength(2)
      expect(pages[0].layout).toBe('grid-2x2')
      expect(pages[0].photoIndices).toHaveLength(4)
      expect(pages[1].layout).toBe('grid-2x2')
      expect(pages[1].photoIndices).toHaveLength(4)
    })

    it('gère le reste de paysages après les grilles 2x2', () => {
      const photos: LayoutPhoto[] = [
        { index: 1, ratio: 'LANDSCAPE' },
        { index: 2, ratio: 'LANDSCAPE' },
        { index: 3, ratio: 'LANDSCAPE' },
        { index: 4, ratio: 'LANDSCAPE' },
        { index: 5, ratio: 'LANDSCAPE' } // Reste 1 après une grille 2x2
      ]

      const pages = generateAutomaticPages(photos)

      expect(pages).toHaveLength(2)
      expect(pages[0].layout).toBe('grid-2x2')
      expect(pages[0].photoIndices).toEqual([1, 2, 3, 4])
      expect(pages[1].layout).toBe('full-page')
      expect(pages[1].photoIndices).toEqual([5])
    })

    it('combine paysages et portraits de manière optimale', () => {
      const photos: LayoutPhoto[] = [
        { index: 1, ratio: 'LANDSCAPE' },
        { index: 2, ratio: 'LANDSCAPE' },
        { index: 3, ratio: 'LANDSCAPE' },
        { index: 4, ratio: 'PORTRAIT' },
        { index: 5, ratio: 'PORTRAIT' },
        { index: 6, ratio: 'PORTRAIT' }
      ]

      const pages = generateAutomaticPages(photos)

      // L'algorithme suit cet ordre :
      // 1. hero-plus-2 avec 2 landscapes + 1 portrait
      // 2. hero-plus-2 avec 2 portraits restants
      // 3. full-page avec 1 landscape restant
      expect(pages).toHaveLength(3)
      expect(pages[0].layout).toBe('hero-plus-2')
      expect(pages[0].photoIndices).toEqual([1, 2, 4])
      expect(pages[1].layout).toBe('hero-plus-2')
      expect(pages[1].photoIndices).toEqual([5, 6])
      expect(pages[2].layout).toBe('full-page')
      expect(pages[2].photoIndices).toEqual([3])
    })
  })
})
