#!/usr/bin/env node
// Télécharge les cartes SVG pour tous les pays listés dans public/data/country_bounding_boxes.json
// et les enregistre dans public/assets/images/maps/<code>.svg avec harmonisation de la couleur.

import { readFile, mkdir, writeFile, access } from 'node:fs/promises'
import { constants as FS } from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const bbPath = path.join(root, 'public', 'data', 'country_bounding_boxes.json')
const outDir = path.join(root, 'public', 'assets', 'images', 'maps')

async function ensureDir(dir) {
  try { await access(dir, FS.F_OK) } catch { await mkdir(dir, { recursive: true }) }
}

async function fetchSvg(code) {
  const codeLc = code.toLowerCase()
  const sources = [
    `https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${codeLc}/vector.svg`,
    `https://cdn.jsdelivr.net/gh/djaiss/mapsicon@master/all/${codeLc}/vector.svg`
  ]
  for (const url of sources) {
    try {
      const resp = await fetch(url, { cache: 'no-store' })
      if (!resp.ok) continue
      let txt = await resp.text()
      // Harmonise la couleur de remplissage avec le thème utilisé dans le HTML
      txt = txt
        .replace(/fill="#000000"/g, 'fill="#4b5a6c"')
        .replace(/fill="#000"/g, 'fill="#4b5a6c"')
        .replace(/fill="currentColor"/g, 'fill="#4b5a6c"')
      return txt
    } catch {
      // ignore and try next source
    }
  }
  return null
}

async function main() {
  await ensureDir(outDir)
  const raw = await readFile(bbPath, 'utf8')
  const json = JSON.parse(raw)
  const codes = Object.keys(json)

  // limit concurrency
  const max = 10
  let ok = 0, fail = 0, skip = 0
  const queue = codes.slice()

  async function worker() {
    while (queue.length) {
      const code = queue.shift()
      const outFile = path.join(outDir, `${code.toLowerCase()}.svg`)
      // Skip if already present
      try { await access(outFile, FS.F_OK); skip++; continue } catch {}
      const svg = await fetchSvg(code)
      if (svg) {
        await writeFile(outFile, svg, 'utf8')
        ok++
        process.stdout.write(`✔ ${code} \n`)
      } else {
        fail++
        process.stderr.write(`✖ ${code} (introuvable)\n`)
      }
    }
  }

  const workers = Array.from({ length: max }, () => worker())
  await Promise.all(workers)

  console.log(`Terminé. Téléchargés: ${ok}, existants: ${skip}, échecs: ${fail}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
