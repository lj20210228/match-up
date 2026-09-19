import { defineConfig } from 'vite';
import react from '@vitejs.plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Matchup - Pronađi meč',
        short_name: 'Matchup',
        description: 'Aplikacija za spajanje igrača i organizaciju sportskih mečeva',
        theme_color: '#0F0F11',
        background_color: '#0F0F11',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});