import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'Green Chicken',
        short_name: 'Green Chicken',
        theme_color: '#1B5E3D',
        background_color: '#1B5E3D',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        importScripts: ['firebase-messaging-sw.js'],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2}'],
        runtimeCaching: [{
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts',
            expiration: { maxEntries: 10, maxAgeSeconds: 31536000 },
          },
        }, {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-files',
            expiration: { maxEntries: 30, maxAgeSeconds: 31536000 },
          },
        }, {
          // Supabase REST API — NetworkFirst: fresh data when online, cached when offline
          urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'supabase-api',
            expiration: { maxEntries: 200, maxAgeSeconds: 3600 },
            networkTimeoutSeconds: 5,
          },
        }, {
          // Supabase Storage (images, avatars) — CacheFirst: rarely changes
          urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'supabase-storage',
            expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
          },
        }, {
          // Google Maps tiles — CacheFirst: map tiles don't change
          urlPattern: /^https:\/\/maps\.googleapis\.com\/maps\/vt\?.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-maps-tiles',
            expiration: { maxEntries: 100, maxAgeSeconds: 604800 },
          },
        }],
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@assets': '/src/public-assets',
    },
  },
  server: {
    allowedHosts: true,
    host: true, // Also allow local network connections
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console.error/warn for debugging production issues
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('zustand')) {
              return 'vendor';
            }
            if (id.includes('supabase')) {
              return 'supabase';
            }
            if (id.includes('qr-code-styling') || id.includes('qrcode')) {
              return 'qrcode';
            }
            if (id.includes('@vis.gl/react-google-maps')) {
              return 'maps';
            }
          }
        },
      },
    },
  },
})
