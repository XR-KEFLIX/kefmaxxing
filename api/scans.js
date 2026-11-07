import fs from 'node:fs/promises'
import path from 'node:path'

const SCAN_DIR = process.env.SCAN_DIR || (process.env.VERCEL ? '/tmp/scans' : path.join(process.cwd(), 'scans'))

async function ensureDir() {
  await fs.mkdir(SCAN_DIR, { recursive: true })
}

async function listScans() {
  await ensureDir()
  const entries = await fs.readdir(SCAN_DIR).catch(() => [])
  return entries
    .filter((name) => /^scan-.*\.jpg$/i.test(name))
    .sort()
    .reverse()
}

function sendJson(res, code, obj) {
  if (!res.status || !res.json) {
    // Fallback if called without the Express-style shim
    res.statusCode = code
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(obj))
    return res
  }
  return res.status(code).json(obj)
}

function send(res, code, headers = {}, body) {
  res.statusCode = code
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.end(body)
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const url = new URL(req.url || 'http://localhost/', 'http://localhost')
    const file = url.searchParams.get('file')

    if (file) {
      if (!/^scan-[A-Za-z0-9._-]+\.jpg$/.test(file)) return sendJson(res, 400, { error: 'Bad filename' })
      const target = path.resolve(SCAN_DIR, path.basename(file))
      if (!target.startsWith(path.resolve(SCAN_DIR))) return sendJson(res, 400, { error: 'Invalid path' })
      try {
        const buffer = await fs.readFile(target)
        return send(res, 200, { 'Content-Type': 'image/jpeg', 'Content-Disposition': `inline; filename="${path.basename(file)}"` }, buffer)
      } catch {
        return sendJson(res, 404, { error: 'Not found' })
      }
    }

    let names = []
    try { names = await listScans() } catch { names = [] }
    return sendJson(res, 200, { count: names.length, scans: names })
  }

  return sendJson(res, 405, { error: 'Method not allowed' })
}
