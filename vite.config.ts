import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function devApiPlugin(): Plugin {
  const routes: Array<[string, string]> = [
    ['/api/rate', '/api/rate.js'],
    ['/api/chat', '/api/chat.js'],
  ]

  return {
    name: 'kefmaxxing-dev-api',
    apply: 'serve',
    configureServer(server) {
      for (const [route, modulePath] of routes) {
        server.middlewares.use(route, async (req, res) => {
          const shim: any = res
          shim.status = (code: number) => {
            res.statusCode = code
            return shim
          }
          shim.json = (obj: unknown) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(obj))
            return shim
          }
          try {
            const mod = await server.ssrLoadModule(modulePath)
            const handler = mod.default as (request: unknown, response: unknown) => Promise<unknown>
            if (req.method === 'POST') {
              let raw = ''
              for await (const chunk of req) raw += chunk
              let parsed: unknown = {}
              try {
                parsed = raw ? JSON.parse(raw) : {}
              } catch {
                parsed = {}
              }
              ;(req as any).body = parsed
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
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('RATE_') && !process.env[key]) process.env[key] = value
  }
  return {
    plugins: [react(), devApiPlugin()],
  }
})
