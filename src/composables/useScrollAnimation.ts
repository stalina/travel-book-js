import { onMounted, onUnmounted, ref, type Ref } from 'vue'

/**
 * useScrollAnimation - Composable pour détecter l'apparition des éléments au scroll
 * 
 * Utilise l'Intersection Observer API pour détecter quand un élément entre dans le viewport
 * et lui ajouter une classe CSS pour déclencher une animation.
 * 
 * @param options - Options de l'Intersection Observer
 * @returns elementRef - Ref à binder sur l'élément, isVisible - État de visibilité
 * 
 * @example
 * const { elementRef, isVisible } = useScrollAnimation()
 * <div ref="elementRef" :class="{ 'fade-in': isVisible }">...</div>
 */

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px', once = true } = options

  const elementRef: Ref<HTMLElement | null> = ref(null)
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!elementRef.value) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            if (once && observer) {
              observer.unobserve(entry.target)
            }
          } else if (!once) {
            isVisible.value = false
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(elementRef.value)
  })

  onUnmounted(() => {
    if (observer && elementRef.value) {
      observer.unobserve(elementRef.value)
      observer.disconnect()
    }
  })

  return {
    elementRef,
    isVisible
  }
}

/**
 * useStaggeredAnimation - Composable pour animer plusieurs éléments avec un délai échelonné
 * 
 * @param count - Nombre d'éléments à animer
 * @param delayIncrement - Délai entre chaque élément (en ms)
 * @returns elementsRef, visibleIndexes
 */
export function useStaggeredAnimation(count: number, delayIncrement = 100) {
  const elementsRef: Ref<HTMLElement[]> = ref([])
  const visibleIndexes = ref<Set<number>>(new Set())
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (elementsRef.value.length === 0) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              visibleIndexes.value.add(index)
            }, index * delayIncrement)
            
            if (observer) {
              observer.unobserve(entry.target)
            }
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px'
      }
    )

    elementsRef.value.forEach((el) => {
      if (el && observer) {
        observer.observe(el)
      }
    })
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    elementsRef,
    visibleIndexes
  }
}
