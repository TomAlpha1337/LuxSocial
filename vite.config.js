import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const NCB_INSTANCE = '53058_luxsocial'
const NCB_TARGET = 'https://app.nocodebackend.com'

/**
 * Transform Set-Cookie headers from NCB for localhost compatibility.
 * NCB sends cookies with __Secure- prefix which browsers reject on http://localhost.
 */
function transformCookie(cookie) {
  const parts = cookie.split(';')
  let nameValue = parts[0].trim()

  // Strip __Secure- or __Host- prefix
  if (nameValue.startsWith('__Secure-')) {
    nameValue = nameValue.replace('__Secure-', '')
  } else if (nameValue.startsWith('__Host-')) {
    nameValue = nameValue.replace('__Host-', '')
  }

  // Filter out attributes that don't work on localhost
  const attrs = parts.slice(1)
    .map(a => a.trim())
    .filter(a => {
      const l = a.toLowerCase()
      return !l.startsWith('domain=') && !l.startsWith('secure') && !l.startsWith('samesite=')
    })

  attrs.push('SameSite=Lax')
  return [nameValue, ...attrs].join('; ')
}

/**
 * Rewrite Set-Cookie headers on proxy responses from NCB auth endpoints.
 */
function onProxyRes(proxyRes) {
  const setCookie = proxyRes.headers['set-cookie']
  if (setCookie) {
    proxyRes.headers['set-cookie'] = setCookie.map(transformCookie)
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/user-auth': {
        target: NCB_TARGET,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyRes', onProxyRes)
        },
      },
      '/api/data': {
        target: NCB_TARGET,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyRes', onProxyRes)
        },
      },
      '/api/public-data': {
        target: NCB_TARGET,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
