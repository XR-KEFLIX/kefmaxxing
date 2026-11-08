import { listScans, getScan, sendJson } from './_scan-store.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const url = new URL(req.url || 'http://localhost/', 'http://localhost')
    const file = url.searchParams.get('file')

    if (file) {
      try {
        const { buffer, filename } = await getScan(file)
        res.statusCode = 200
        res.setHeader('Content-Type', 'image/jpeg')
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        return res.end(buffer)
      } catch (e) {
        return sendJson(res, e.code || 404, { error: e.message })
      }
    }

    try {
      const scans = await listScans()
      res.setHeader('Cache-Control', 'no-store')
      return sendJson(res, 200, { count: scans.length, scans })
    } catch (e) {
      return sendJson(res, 500, { error: e.message })
    }
  }

  return sendJson(res, 405, { error: 'Method not allowed' })
}
