const MAX_EDGE = 1280
const JPEG_QUALITY = 0.84
const MAX_DATA_URL_CHARS = 5_200_000

export async function preparePhoto(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('That file is not an image. Use a JPEG, PNG or WebP photo.')
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Photo is over 15 MB. Use a smaller one.')
  }

  const bitmap = await loadBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not process the photo in this browser.')
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close()

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  if (dataUrl.length > MAX_DATA_URL_CHARS) {
    throw new Error('Photo is still too large after compression. Try a tighter crop.')
  }
  return dataUrl
}

async function loadBitmap(file) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      /* fall through to the  path */
    }
  }
  return await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image file.'))
    }
    img.src = url
  })
}
