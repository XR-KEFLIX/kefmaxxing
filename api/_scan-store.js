import fs from 'node:fs/promises'
import path from 'node:path'

const SCAN_DIR = process.env.SCAN_DIR || (process.env.VERCEL ? '/tmp/scans' : path.join(process.cwd(), 'scans'))

// Private GitHub repo used as persistent scan storage when deployed.
// Local development keeps writing to the scans/ folder instead.
const GH_TOKEN = process.env.GITHUB_SCANS_TOKEN || ''
const GH_REPO = process.env.GITHUB_SCANS_REPO || ''
const GH_BRANCH = process.env.GITHUB_SCANS_BRANCH || 'main'
const GH_API = 'https://api.github.com'
const USE_GITHUB = Boolean(GH_TOKEN && GH_REPO) && (Boolean(process.env.VERCEL) || process.env.FORCE_GITHUB === '1')

const INDEX_PATH = 'scans/index.json'

function scanFilename() {
  return `scan-${new Date().toISOString().replace(/[:.]/g, '-')}-${Math.random().toString(36).slice(2, 8)}.jpg`
}

function diskFilePath(name) {
  return path.resolve(SCAN_DIR, path.basename(name))
}

function metaPathFor(name) {
  return diskFilePath(name).replace(/\.jpg$/i, '.json')
}

function safeName(name) {
  const base = String(name || '').split('/').pop()
  if (!/^scan-[A-Za-z0-9._-]+\.jpg$/i.test(base)) {
    throw Object.assign(new Error('Bad filename'), { code: 400 })
  }
  return base
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function ghRequest(endpoint, options = {}) {
  const res = await fetch(`${GH_API}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'kefmaxxing',
      ...(options.headers || {}),
    },
  })
  return res
}

async function ghGetRaw(repoPath) {
  const res = await ghRequest(`/repos/${GH_REPO}/contents/${repoPath}?ref=${GH_BRANCH}`, {
    headers: { Accept: 'application/vnd.github.raw' },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub read failed (${res.status})`)
  return Buffer.from(await res.arrayBuffer())
}

async function ghGetJson(repoPath) {
  const res = await ghRequest(`/repos/${GH_REPO}/contents/${repoPath}?ref=${GH_BRANCH}`)
  if (res.status === 404) return { data: null, sha: null }
  if (!res.ok) throw new Error(`GitHub read failed (${res.status})`)
  const json = await res.json()
  const raw = Buffer.from(json.content || '', 'base64').toString('utf8')
  return { data: raw ? JSON.parse(raw) : null, sha: json.sha || null }
}

async function ghPut(repoPath, buffer, message, sha) {
  const body = {
    message,
    content: Buffer.from(buffer).toString('base64'),
    branch: GH_BRANCH,
  }
  if (sha) body.sha = sha
  const res = await ghRequest(`/repos/${GH_REPO}/contents/${repoPath}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GitHub write failed (${res.status}) ${text.slice(0, 180)}`)
  }
  return res.json()
}

// Serialise index updates with retries so concurrent scans do not drop entries.
async function updateIndex(mutator) {
  let lastError = null
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { data, sha } = await ghGetJson(INDEX_PATH)
    const current = Array.isArray(data) ? data : []
    const next = mutator(current) || current
    try {
      await ghPut(INDEX_PATH, Buffer.from(JSON.stringify(next, null, 2), 'utf8'), 'Update scan index', sha)
      return next
    } catch (error) {
      lastError = error
      await sleep(150 * (attempt + 1))
    }
  }
  throw lastError || new Error('Could not update scan index')
}

async function writeMeta(name, meta) {
  if (!meta || typeof meta !== 'object') return
  const payload = JSON.stringify(meta, null, 2)
  try {
    await fs.mkdir(SCAN_DIR, { recursive: true })
    await fs.writeFile(metaPathFor(name), payload, 'utf8')
  } catch {}
}

async function readDiskMeta(name) {
  try {
    const raw = await fs.readFile(metaPathFor(name), 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function indexEntry(name, size, meta) {
  return {
    name,
    pathname: name,
    size,
    uploadedAt: (meta && (meta.savedAt || meta.sentAt)) || new Date().toISOString(),
    meta: meta || null,
  }
}

export async function saveScan(image, meta) {
  try {
    const base64 = String(image || '').replace(/^data:image\/[a-z0-9.]+;base64,/, '')
    const buffer = Buffer.from(base64, 'base64')
    if (!buffer.length) return null
    const filename = scanFilename()
    const metaPayload = {
      filename,
      savedAt: new Date().toISOString(),
      ...(meta && typeof meta === 'object' ? meta : {}),
    }

    if (USE_GITHUB) {
      try {
        await ghPut(`scans/${filename}`, buffer, `Add scan ${filename}`)
        const entry = indexEntry(filename, buffer.length, metaPayload)
        await updateIndex((list) => [entry, ...list.filter((item) => item && item.name !== filename)])
        return { filename, pathname: filename, url: null }
      } catch (error) {
        console.error('[scan-store] github save failed, falling back to disk', error && error.message)
      }
    }

    await fs.mkdir(SCAN_DIR, { recursive: true })
    await fs.writeFile(diskFilePath(filename), buffer)
    await writeMeta(filename, metaPayload)
    return { filename, pathname: filename, url: null }
  } catch (error) {
    console.error('[scan-store] scan save failed', error && error.message)
    return null
  }
}

export async function updateScanMeta(filename, patch) {
  try {
    const name = safeName(filename)
    const merged = { ...(patch && typeof patch === 'object' ? patch : {}), updatedAt: new Date().toISOString() }

    if (USE_GITHUB) {
      try {
        await updateIndex((list) => {
          let found = false
          const next = list.map((item) => {
            if (!item || item.name !== name) return item
            found = true
            return { ...item, meta: { ...(item.meta || {}), ...merged } }
          })
          if (!found) next.unshift(indexEntry(name, null, merged))
          return next
        })
        return { filename: name, ...merged }
      } catch (error) {
        console.error('[scan-store] github meta update failed', error && error.message)
      }
    }

    const existing = (await readDiskMeta(name)) || { filename: name }
    const next = { ...existing, ...merged }
    await writeMeta(name, next)
    return next
  } catch (error) {
    console.error('[scan-store] meta update failed', error && error.message)
    return null
  }
}

export async function listScans({ includeMeta = true } = {}) {
  const out = []

  if (USE_GITHUB) {
    try {
      const { data } = await ghGetJson(INDEX_PATH)
      if (Array.isArray(data)) {
        for (const item of data) {
          if (!item || !item.name) continue
          const name = String(item.name).split('/').pop()
          if (!/^scan-.*\.jpg$/i.test(name)) continue
          out.push({
            name,
            pathname: name,
            url: `/api/scans?file=${encodeURIComponent(name)}`,
            source: 'github',
            size: item.size,
            uploadedAt: item.uploadedAt,
            meta: includeMeta ? item.meta || null : undefined,
          })
        }
      }
    } catch (error) {
      console.error('[scan-store] github list failed', error && error.message)
    }
  }

  // Local disk (dev + /tmp fallback)
  try {
    await fs.mkdir(SCAN_DIR, { recursive: true })
    const entries = await fs.readdir(SCAN_DIR).catch(() => [])
    for (const name of entries.filter((entry) => /^scan-.*\.jpg$/i.test(entry)).sort().reverse()) {
      if (out.some((scan) => scan.name === name)) continue
      try {
        const stat = await fs.stat(diskFilePath(name))
        out.push({
          name,
          pathname: name,
          url: `/api/scans?file=${encodeURIComponent(name)}`,
          source: 'disk',
          size: stat.size,
          meta: includeMeta ? await readDiskMeta(name) : undefined,
        })
      } catch {}
    }
  } catch {}

  out.sort((a, b) => {
    const da = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0
    const db = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0
    if (da !== db) return db - da
    return String(b.name).localeCompare(String(a.name))
  })

  return out
}

export async function getScan(file) {
  const baseName = safeName(file)

  // Disk first (dev + /tmp)
  try {
    const buffer = await fs.readFile(diskFilePath(baseName))
    return { buffer, filename: baseName }
  } catch {}

  if (USE_GITHUB) {
    try {
      const buffer = await ghGetRaw(`scans/${baseName}`)
      if (buffer) return { buffer, filename: baseName }
    } catch (error) {
      console.error('[scan-store] github get failed', error && error.message)
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
