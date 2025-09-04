export type FFInput =
  | { kind: 'fs'; dirHandle: FileSystemDirectoryHandle }
  | { kind: 'files'; files: File[] }

export async function readTripDirectory(): Promise<FFInput> {
  if ('showDirectoryPicker' in window) {
    const dirHandle = await (window as any).showDirectoryPicker()
    return { kind: 'fs', dirHandle }
  }
  throw new Error('File System Access API non disponible. Utilisez la sélection de fichiers.')
}

export async function readFileFromPath(input: FFInput, pathParts: string[]): Promise<File | null> {
  try {
    if (input.kind === 'fs') {
      let handle: FileSystemHandle = input.dirHandle
      for (const part of pathParts) {
        // @ts-ignore
        handle = await (handle as any).getDirectoryHandle?.(part) ?? await (handle as any).getFileHandle?.(part)
      }
      // @ts-ignore
      const file = await (handle as any).getFile?.()
      return file ?? null
    } else {
      const rel = pathParts.join('/')
      const file = input.files.find(f => f.webkitRelativePath.endsWith(rel) || f.name === pathParts[pathParts.length-1])
      return file ?? null
    }
  } catch {
    return null
  }
}

export async function readAllPhotos(input: FFInput, stepSlug: string, stepId: number): Promise<File[]> {
  const dir = `${stepSlug}_${stepId}/photos/`
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
    } catch {
      // ignore
    }
    return photos.sort((a,b)=> a.name.localeCompare(b.name))
  } else {
    return input.files
      .filter(f => f.webkitRelativePath.includes(dir))
      .sort((a,b)=> a.name.localeCompare(b.name))
  }
}
