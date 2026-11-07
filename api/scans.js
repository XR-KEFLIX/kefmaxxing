import { listScans, getScan, sendJson } from './_scan-store.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const url = new URL(req.url || 'http://localhost/', 'http://localhost')
    const file = url.searchParams.get('file')

    if (file) {
      try {
        const { buffer, filename, url: blobUrl } = await getScan(file)
        if (blobUrl && !buffer) {
          // Redirect to the direct Vercel Blob URL for blob-backed scans
          res.statusCode = 302
          res.setHeader('Location', blobUrl)
          return res.end()
        }
        res.statusCode = 200
        res.setHeader('Content-Type', 'image/jpeg')
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
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

  return sendJson(res, 405, { error: 'Method not allowed' })
}
