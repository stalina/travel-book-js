// @ts-nocheck
import { beforeAll } from 'vitest'

beforeAll(() => {
  // Global fetch mock to avoid external network calls (map tiles, assets)
  // We override fetch even if it exists so we can intercept tile/image requests
  // and return a tiny PNG. For non-image requests we delegate to the original
  // fetch if present to avoid breaking other behaviours.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const originalFetch = (globalThis as any).fetch
  ;(globalThis as any).fetch = async (input: RequestInfo, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : String((input as Request).url || input)
    const isImage = /tile|map|arcgis|openstreetmap|\.png|\.jpg|\.jpeg|\.svg/i.test(url)

    if (isImage) {
      const headers = new Headers({ 'content-type': 'image/png' })
      // tiny transparent PNG (1x1)
      const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
      let body: Uint8Array
      if (typeof (globalThis as any).atob === 'function') {
        body = Uint8Array.from(atob(tinyPngBase64), (c: string) => c.charCodeAt(0))
      } else if (typeof (globalThis as any).Buffer !== 'undefined') {
        // Use global Buffer when available (Node env) but cast to any to avoid TS lib issues
        body = Uint8Array.from((globalThis as any).Buffer.from(tinyPngBase64, 'base64'))
      } else {
        body = new Uint8Array()
      }
  // Use the underlying ArrayBuffer as Response body (accepted by BodyInit)
  const arrayBuffer = body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength)
  return new Response(arrayBuffer, { status: 200, headers })
    }

    // For other requests, delegate to original fetch if available, else return empty 200
    if (typeof originalFetch === 'function') {
      return originalFetch(input, init)
    }

    return new Response(null, { status: 200 })
  }
})
