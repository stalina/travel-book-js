export function normalizeHtml(html: string) {
  return html.replace(/\s+/g, ' ').trim()
}
