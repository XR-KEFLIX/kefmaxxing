import { listScans, getScan, sendJson } from './_scan-store.js'

function readToken(req) {
  const h = (req && req.headers) || {}
  const auth = h.authorization || h.Authorization
  if (typeof auth === 'string' && /^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, '').trim()
  const direct = h['x-admin-token'] || h['x-scans-token']
  if (typeof direct === 'string') return direct.trim()
  return ''
}

const authFailures = new Map()
function limitAuthFailures(req) {
  const h = (req && req.headers) || {}
  const ip = String(h['x-forwarded-for'] || h['x-real-ip'] || 'unknown').split(',')[0].trim() || 'unknown'
  const now = Date.now()
  const entry = authFailures.get(ip) || { count: 0, reset: now + 10 * 60 * 1000 }
  if (now > entry.reset) { entry.count = 0; entry.reset = now + 10 * 60 * 1000 }
  entry.count += 1
  authFailures.set(ip, entry)
  return entry.count > 30
}

function isAuthorized(req) {
  const expected = process.env.ADMIN_SCANS_TOKEN || process.env.SCANS_ADMIN_TOKEN || ''
  if (!expected) return !process.env.VERCEL
  const provided = readToken(req)
  if (!provided || provided.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i)
  return diff === 0
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'no-referrer')

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  if (!isAuthorized(req)) {
    const limited = limitAuthFailures(req)
    return sendJson(res, limited ? 429 : 401, { error: limited ? 'Too many requests' : 'Unauthorized', message: limited ? 'Too many failed attempts. Try again later.' : 'Admin token required.' })
  }

  const url = new URL(req.url || 'http://localhost/', 'http://localhost')
  const file = url.searchParams.get('file')

  if (file) {
    try {
      const { buffer, filename } = await getScan(file)
      res.statusCode = 200
      res.setHeader('Content-Type', 'image/jpeg')
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
      res.setHeader('Cache-Control', 'private, no-store')
      return res.end(buffer)
    } catch (e) {
      return sendJson(res, e.code || 404, { error: e.message })
    }
  }

  try {
    const scans = await listScans()
    return sendJson(res, 200, { count: scans.length, scans })
  } catch (e) {
    return sendJson(res, 500, { error: e.message })
  }
}
