import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const resolvedPort = Number(process.env.PORT ?? process.env.VITE_PORT ?? 0) || 5173;
  const resolvedPreviewPort = Number(process.env.PREVIEW_PORT ?? resolvedPort);

  const shouldEnableLovableTagger =
    mode === "development" && process.env.ENABLE_LOVABLE_TAGGER === "true";

  // Use GitHub Pages base path in production when deployed to GitHub Pages
  // In Lovable or local dev, base will be '/'
  const base = process.env.GITHUB_PAGES === 'true' ? '/state-shift-strategy/' : '/';

  return {
    base,
    server: {
      host: "0.0.0.0",
      port: resolvedPort,
    },
    preview: {
      host: "0.0.0.0",
      port: resolvedPreviewPort,
    },
    plugins: [
      react(),
      shouldEnableLovableTagger && componentTagger(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'icons/*.png',
          'icons/*.svg',
          'assets/**/*',
          'card-art/**/*',
          'audio/**/*',
          'extensions/**/*',
          'lovable-uploads/**/*'
        ],
        manifest: {
          name: 'Paranoid Times - State Shift Strategy',
          short_name: 'Paranoid Times',
          description: 'A conspiracy-themed card strategy game. Control the narrative, capture states, and expose the truth!',
          theme_color: '#c4a000',
          background_color: '#1a1a2e',
          display: 'standalone',
          orientation: 'any',
          categories: ['games', 'entertainment'],
          start_url: base,
          scope: base,
          icons: [
            {
              src: `${base}icons/icon-72.png`,
              sizes: '72x72',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: `${base}icons/icon-96.png`,
              sizes: '96x96',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: `${base}icons/icon-128.png`,
              sizes: '128x128',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: `${base}icons/icon-144.png`,
              sizes: '144x144',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: `${base}icons/icon-152.png`,
              sizes: '152x152',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: `${base}icons/icon-192.png`,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: `${base}icons/icon-384.png`,
              sizes: '384x384',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: `${base}icons/icon-512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: `${base}icons/icon-maskable-192.png`,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: `${base}icons/icon-maskable-512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          // Cache strategies for different resource types
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp,woff,woff2,mp3,json}'],
          // Maximum cache size (100MB for game assets)
          maximumFileSizeToCacheInBytes: 100 * 1024 * 1024,
          // Offline fallback
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api/, /^\/_/],
          runtimeCaching: [
            {
              // Cache Google Fonts
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Cache images
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 500,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            },
            {
              // Cache audio files
              urlPattern: /\.(?:mp3|wav|ogg)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'audio-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: false // Disable in dev mode to avoid issues
        }
      })
    ].filter(Boolean),
    resolve: {
      alias: [
        {
          find: "@/public",
          replacement: path.resolve(__dirname, "./public"),
        },
        {
          find: "@",
          replacement: path.resolve(__dirname, "./src"),
        },
      ],
    },
    build: {
      // Split heavy third-party libs out of the main bundle so the initial
      // download stays smaller and the vendor chunk can be cached
      // independently from app code.
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) {
              return undefined;
            }
            if (id.includes("react-dom")) return "vendor-react";
            if (/[\\/]node_modules[\\/]react[\\/]/.test(id)) return "vendor-react";
            if (id.includes("scheduler")) return "vendor-react";
            if (id.includes("@radix-ui")) return "vendor-radix";
            if (id.includes("lucide-react")) return "vendor-icons";
            if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
            if (
              id.includes("@tanstack") ||
              id.includes("react-hook-form") ||
              id.includes("zod") ||
              id.includes("react-router")
            ) {
              return "vendor-app";
            }
            if (id.includes("peerjs")) return "vendor-peerjs";
            return undefined;
          },
        },
      },
    },
  };
});
