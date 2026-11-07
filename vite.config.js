import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function devApiPlugin() {
  const routes = [
    ['/api/rate', '/api/rate.js'],
    ['/api/chat', '/api/chat.js'],
    ['/api/scans', '/api/scans.js'],
  ]

  return {
    name: 'kefmaxxing-dev-api',
    apply: 'serve',
    configureServer(server) {
      for (const [route, modulePath] of routes) {
        server.middlewares.use(route, async (req, res) => {
          const shim = res
          shim.status = (code) => {
            res.statusCode = code
            return shim
          }
          shim.json = (obj) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(obj))
            return shim
          }
          try {
            const mod = await server.ssrLoadModule(modulePath)
            const handler = mod.default
            if (req.method === 'POST') {
              const chunks = []
              await new Promise((resolve, reject) => {
                req.on('data', (chunk) => chunks.push(chunk))
                req.on('end', () => {
                  const raw = Buffer.concat(chunks).toString('utf8')
                  let parsed = {}
                  try { parsed = raw ? JSON.parse(raw) : {} } catch { parsed = {} }
                  req.body = parsed
                  resolve()
                })
                req.on('error', reject)
              })
            }
            await handler(req, shim)
          } catch {
            shim
              .status(500)
              .json({ error: 'Dev API error', message: 'The local dev API failed to handle the request.' })
          }
        })
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiPrefixes = ['RATE_', 'UNOROUTER_', 'OPENROUTER_', 'GEMINI_']
  for (const [key, value] of Object.entries(env)) {
    if (apiPrefixes.some((prefix) => key.startsWith(prefix)) && !process.env[key]) process.env[key] = value
  }
  return {
    plugins: [react(), devApiPlugin()],
  }
})
