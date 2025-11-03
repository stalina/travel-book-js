import { describe, it, expect } from 'vitest'
import { useTextFormatting } from '../../src/composables/useTextFormatting'

describe('useTextFormatting', () => {
  it('sanitizes HTML correctly', () => {
    const { sanitizeHtml } = useTextFormatting()
    
    const dirtyHtml = '<p>Test</p><script>alert("xss")</script>'
    const clean = sanitizeHtml(dirtyHtml)
    
    expect(clean).not.toContain('<script>')
    expect(clean).toContain('Test')
  })

  it('removes disallowed tags from HTML', () => {
    const { sanitizeHtml } = useTextFormatting()
    
    const html = '<div><button>Click</button><span>Text</span></div>'
    const clean = sanitizeHtml(html)
    
    expect(clean).not.toContain('<button>')
    expect(clean).not.toContain('<div>')
    expect(clean).not.toContain('<span>')
  })

  it('keeps allowed tags in HTML', () => {
    const { sanitizeHtml } = useTextFormatting()
    
    const html = '<h1>Title</h1><p>Para</p><strong>Bold</strong><em>Italic</em><ul><li>Item</li></ul>'
    const clean = sanitizeHtml(html)
    
    expect(clean).toContain('<h1>')
    expect(clean).toContain('<p>')
    expect(clean).toContain('<strong>')
    expect(clean).toContain('<em>')
    expect(clean).toContain('<ul>')
    expect(clean).toContain('<li>')
  })
})
