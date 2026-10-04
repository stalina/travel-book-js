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

  it('keeps the whole allowed formatting set unchanged', () => {
    const { sanitizeHtml } = useTextFormatting()

    const html = '<h1>A</h1><h2>B</h2><h3>C</h3>' +
      '<p><b>b</b><i>i</i><u>u</u><s>s</s><strong>strong</strong><em>em</em><br></p>' +
      '<ul><li>one</li></ul><ol><li>two</li></ol>'

    expect(sanitizeHtml(html)).toBe(html)
  })

  it('removes script and style elements with their content', () => {
    const { sanitizeHtml } = useTextFormatting()

    const clean = sanitizeHtml('<p>Visible</p><style>p { color: red }</style><div><script>alert(1)</script>Text</div>')

    expect(clean).toBe('<p>Visible</p>Text')
  })

  it('replaces disallowed tags with their text content', () => {
    const { sanitizeHtml } = useTextFormatting()

    expect(sanitizeHtml('<p>Hello <span>big <b>world</b></span></p>')).toBe('<p>Hello big world</p>')
  })

  it('strips event handler attributes from allowed tags', () => {
    const { sanitizeHtml } = useTextFormatting()

    const clean = sanitizeHtml(
      '<p onmouseover="alert(1)">x</p><b onclick="alert(2)">y</b><ul onfocus="alert(3)"><li onerror="alert(4)">z</li></ul>'
    )

    expect(clean).toBe('<p>x</p><b>y</b><ul><li>z</li></ul>')
  })

  it('strips style, class and any other attribute from allowed tags', () => {
    const { sanitizeHtml } = useTextFormatting()

    const clean = sanitizeHtml(
      '<b style="background:url(javascript:alert(1))">bold</b>' +
      '<p class="evil" id="x" data-x="1" title="t">para</p>' +
      '<h2 STYLE="color:red" Class="big">title</h2>'
    )

    expect(clean).toBe('<b>bold</b><p>para</p><h2>title</h2>')
  })

  it('does not run <img onerror> handlers while sanitizing', async () => {
    const { sanitizeHtml } = useTextFormatting()

    const clean = sanitizeHtml('<p>before</p><img src="x" onerror="window.__xss = true"><p>after</p>')
    // Laisse le temps à un éventuel chargement d'image d'échouer et de déclencher onerror
    await new Promise(resolve => setTimeout(resolve, 0))

    expect((window as unknown as { __xss?: boolean }).__xss).toBeUndefined()
    expect(clean).toBe('<p>before</p><p>after</p>')
  })

  it('reduces javascript: links to their text', () => {
    const { sanitizeHtml } = useTextFormatting()

    const clean = sanitizeHtml('<p>Go <a href="javascript:alert(1)" onclick="alert(2)">there</a></p>')

    expect(clean).toBe('<p>Go there</p>')
    expect(clean).not.toContain('javascript:')
  })

  it('escapes markup that ends up as text', () => {
    const { sanitizeHtml } = useTextFormatting()

    const clean = sanitizeHtml('<p>a &lt;img src=x onerror=alert(1)&gt; b</p>')

    expect(clean).toBe('<p>a &lt;img src=x onerror=alert(1)&gt; b</p>')
  })
})
