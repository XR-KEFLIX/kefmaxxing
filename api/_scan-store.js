import fs from 'node:fs/promises'
import path from 'node:path'

const SCAN_DIR = process.env.SCAN_DIR || (process.env.VERCEL ? '/tmp/scans' : path.join(process.cwd(), 'scans'))
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_TOKEN || ''

function scanFilename() {
  return `scan-${new Date().toISOString().replace(/[:.]/g, '-')}-${Math.random().toString(36).slice(2, 8)}.jpg`
}

function diskFilePath(name) {
  return path.resolve(SCAN_DIR, path.basename(name))
}

function metaPathFor(name) {
  return diskFilePath(name).replace(/\.jpg$/i, '.json')
}

async function writeMeta(name, meta) {
  if (!meta || typeof meta !== 'object') return
  const payload = JSON.stringify(meta, null, 2)
  // Disk
  try {
    await fs.mkdir(SCAN_DIR, { recursive: true })
    await fs.writeFile(metaPathFor(name), payload, 'utf8')
  } catch {}
  // Blob
  if (BLOB_TOKEN) {
    try {
      const { put } = await import('@vercel/blob')
      await put(`scans/${name.replace(/\.jpg$/i, '.json')}`, Buffer.from(payload, 'utf8'), {
        access: 'public',
        contentType: 'application/json',
        token: BLOB_TOKEN,
        addRandomSuffix: false,
        allowOverwrite: true,
      })
    } catch (e) {
      console.error('[scan-store] meta blob save failed', e && e.message)
    }
  }
}

async function readMeta(name) {
  // Disk first
  try {
    const raw = await fs.readFile(metaPathFor(name), 'utf8')
    return JSON.parse(raw)
  } catch {}
  // Blob
  if (BLOB_TOKEN) {
    try {
      const { list } = await import('@vercel/blob')
      const metaName = name.replace(/\.jpg$/i, '.json')
      const res = await list({ token: BLOB_TOKEN, prefix: `scans/${metaName}`, limit: 5 })
      const hit = (res.blobs || []).find((b) => String(b.pathname || '').endsWith(metaName))
      if (hit) {
        const r = await fetch(hit.url)
        if (r.ok) return await r.json()
      }
    } catch {}
  }
  return null
}

export async function saveScan(image, meta) {
  try {
    const base64 = String(image || '').replace(/^data:image\/[a-z0-9.]+;base64,/, '')
    const buffer = Buffer.from(base64, 'base64')
    if (!buffer.length) return null
    const filename = scanFilename()
    const metaPayload = { filename, savedAt: new Date().toISOString(), ...(meta && typeof meta === 'object' ? meta : {}) }

    // Prefer persistent Blob storage when deployed
    if (BLOB_TOKEN) {
      try {
        const { put } = await import('@vercel/blob')
        const blob = await put(`scans/${filename}`, buffer, {
          access: 'public',
          contentType: 'image/jpeg',
          token: BLOB_TOKEN,
          addRandomSuffix: false,
        })
        await writeMeta(filename, metaPayload)
        // Also write locally in dev so /scans folder stays populated
        if (!process.env.VERCEL) {
          await fs.mkdir(SCAN_DIR, { recursive: true })
          await fs.writeFile(diskFilePath(filename), buffer)
        }
        return { filename, pathname: blob.pathname || `scans/${filename}`, url: blob.url || null }
      } catch (e) {
        console.error('[scan-store] blob save failed, falling back to disk', e && e.message)
      }
    }

    await fs.mkdir(SCAN_DIR, { recursive: true })
    await fs.writeFile(diskFilePath(filename), buffer)
    await writeMeta(filename, metaPayload)
    return { filename, pathname: filename, url: null }
  } catch (e) {
    console.error('[scan-store] scan save failed', e && e.message)
    return null
  }
}

export async function updateScanMeta(filename, patch) {
  try {
    const name = String(filename || '').split('/').pop()
    if (!/^scan-[A-Za-z0-9._-]+\.jpg$/i.test(name)) return null
    const existing = (await readMeta(name)) || { filename: name }
    const next = { ...existing, ...(patch && typeof patch === 'object' ? patch : {}), updatedAt: new Date().toISOString() }
    await writeMeta(name, next)
    return next
  } catch (e) {
    console.error('[scan-store] meta update failed', e && e.message)
    return null
  }
}

export async function listScans({ includeMeta = true } = {}) {
  const out = [] // [{name, pathname, url, source, meta?}]

  // Local disk (dev + /tmp fallback)
  try {
    await fs.mkdir(SCAN_DIR, { recursive: true })
    const entries = await fs.readdir(SCAN_DIR).catch(() => [])
    for (const name of entries.filter((n) => /^scan-.*\.jpg$/i.test(n)).sort().reverse()) {
      try {
        const stat = await fs.stat(diskFilePath(name))
        out.push({
          name,
          pathname: name,
          url: `/api/scans?file=${encodeURIComponent(name)}`,
          source: 'disk',
          size: stat.size,
        })
      } catch {}
    }
  } catch {}

  // Blob (deployed persistent storage)
  if (BLOB_TOKEN) {
    try {
      const { list } = await import('@vercel/blob')
      const res = await list({ token: BLOB_TOKEN, prefix: 'scans/', limit: 200 })
      for (const b of res.blobs || []) {
        const pathname = b.pathname || b.url || ''
        const baseName = pathname.split('/').pop()
        if (!/^scan-.*\.jpg$/i.test(baseName || '')) continue
        if (out.some((s) => s.name === baseName)) continue
        out.push({
          name: baseName,
          pathname: pathname || baseName,
          url: `/api/scans?file=${encodeURIComponent(pathname || baseName)}`,
          source: 'blob',
          size: b.size,
          uploadedAt: b.uploadedAt,
        })
      }
    } catch (e) {
      console.error('[scan-store] blob list failed', e && e.message)
    }
  }

  // Newest first
  out.sort((a, b) => {
    const da = a.uploadedAt ? new Date(a.uploadedAt).getTime() : (a.name.match(/scan-(\d{4}-\d{2}-\d{2}T[\d-:]+)/) || [null, a.name])[1]
    const db = b.uploadedAt ? new Date(b.uploadedAt).getTime() : (b.name.match(/scan-(\d{4}-\d{2}-\d{2}T[\d-:]+)/) || [null, b.name])[1]
    return String(db) > String(da) ? 1 : -1
  })

  if (includeMeta) {
    await Promise.all(out.map(async (s) => { try { s.meta = await readMeta(s.name) } catch { s.meta = null } }))
  }

  return out
}

export async function getScan(file) {
  // file may be a bare filename or a blob pathname like scans/scan-….jpg
  const baseName = String(file || '').split('/').pop()
  if (!/^scan-[A-Za-z0-9._-]+\.jpg$/i.test(baseName)) throw Object.assign(new Error('Bad filename'), { code: 400 })

  // Try disk first (dev + /tmp)
  try {
    const buffer = await fs.readFile(diskFilePath(baseName))
    return { buffer, filename: baseName }
  } catch {}

  // Then blob (deployed persistent)
  if (BLOB_TOKEN) {
    try {
      const { list } = await import('@vercel/blob')
      const res = await list({ token: BLOB_TOKEN, prefix: 'scans/', limit: 200 })
      const hit = (res.blobs || []).find((b) => String(b.pathname || b.url || '').endsWith(baseName))
      if (hit) {
        const r = await fetch(hit.url)
        if (r.ok) {
          const buffer = Buffer.from(await r.arrayBuffer())
          return { buffer, filename: baseName, url: hit.url }
        }
      }
    } catch (e) {
      console.error('[scan-store] blob get failed', e && e.message)
    }
  }

  throw Object.assign(new Error('Not found'), { code: 404 })
}

export function sendJson(res, code, obj) {
  if (!res.status || !res.json) {
    res.statusCode = code
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(obj))
    return res
  }
  return res.status(code).json(obj)
}

function sendBuffer(res, code, headers = {}, buffer, filename) {
  res.statusCode = code
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.setHeader('Content-Disposition', `inline; filename="${filename || 'scan.jpg'}"`)
  res.end(buffer)
}
