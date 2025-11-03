import { ref } from 'vue'

/**
 * Types de formatage supportés
 */
export type FormatType = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'h1' | 'h2' | 'h3' | 'ul' | 'ol'

/**
 * Composable pour gérer le formatage de texte riche
 * Utilise l'API document.execCommand (legacy mais bien supporté)
 */
export function useTextFormatting() {
  const isFormatActive = ref<Record<FormatType, boolean>>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    h1: false,
    h2: false,
    h3: false,
    ul: false,
    ol: false
  })

  /**
   * Applique un formatage au texte sélectionné
   */
  const applyFormat = (format: FormatType) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    switch (format) {
      case 'bold':
        document.execCommand('bold', false)
        break
      case 'italic':
        document.execCommand('italic', false)
        break
      case 'underline':
        document.execCommand('underline', false)
        break
      case 'strikethrough':
        document.execCommand('strikeThrough', false)
        break
      case 'h1':
        document.execCommand('formatBlock', false, 'h1')
        break
      case 'h2':
        document.execCommand('formatBlock', false, 'h2')
        break
      case 'h3':
        document.execCommand('formatBlock', false, 'h3')
        break
      case 'ul':
        document.execCommand('insertUnorderedList', false)
        break
      case 'ol':
        document.execCommand('insertOrderedList', false)
        break
    }

    updateActiveFormats()
  }

  /**
   * Met à jour l'état des formats actifs basé sur la sélection courante
   */
  const updateActiveFormats = () => {
    isFormatActive.value.bold = document.queryCommandState('bold')
    isFormatActive.value.italic = document.queryCommandState('italic')
    isFormatActive.value.underline = document.queryCommandState('underline')
    isFormatActive.value.strikethrough = document.queryCommandState('strikeThrough')
    
    // Headers et listes nécessitent une détection différente
    const selection = window.getSelection()
    if (selection && selection.anchorNode) {
      const parentElement = selection.anchorNode.parentElement
      if (parentElement) {
        isFormatActive.value.h1 = parentElement.tagName === 'H1'
        isFormatActive.value.h2 = parentElement.tagName === 'H2'
        isFormatActive.value.h3 = parentElement.tagName === 'H3'
        
        // Chercher une liste parent
        let element: HTMLElement | null = parentElement
        isFormatActive.value.ul = false
        isFormatActive.value.ol = false
        
        while (element && element !== document.body) {
          if (element.tagName === 'UL') {
            isFormatActive.value.ul = true
            break
          }
          if (element.tagName === 'OL') {
            isFormatActive.value.ol = true
            break
          }
          element = element.parentElement
        }
      }
    }
  }

  /**
   * Nettoie le HTML en conservant uniquement les tags autorisés
   */
  const sanitizeHtml = (html: string): string => {
    const allowedTags = ['b', 'i', 'u', 's', 'strong', 'em', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'p', 'br']
    const div = document.createElement('div')
    div.innerHTML = html

    // Supprimer les scripts et styles
    const scripts = div.querySelectorAll('script, style')
    scripts.forEach(script => script.remove())

    // Filtrer les tags non autorisés
    const allElements = div.querySelectorAll('*')
    allElements.forEach(element => {
      if (!allowedTags.includes(element.tagName.toLowerCase())) {
        // Remplacer par le contenu texte
        const textNode = document.createTextNode(element.textContent || '')
        element.parentNode?.replaceChild(textNode, element)
      }
    })

    return div.innerHTML
  }

  /**
   * Gère les événements de sélection/changement pour mettre à jour l'état
   */
  const handleSelectionChange = () => {
    updateActiveFormats()
  }

  return {
    isFormatActive,
    applyFormat,
    updateActiveFormats,
    sanitizeHtml,
    handleSelectionChange
  }
}
