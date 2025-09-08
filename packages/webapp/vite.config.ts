import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import IstanbulPlugin from 'vite-plugin-istanbul';
import { VitePWA } from 'vite-plugin-pwa';
import svgrPlugin from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    { enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react' }) },
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    svgrPlugin({
      svgrOptions: {
        icon: false,
      },
    }),
    IstanbulPlugin({
      include: 'src/*',
      exclude: ['node_modules', 'tests/'],
      extension: ['.js', '.ts', '.jsx'],
      requireEnv: true,
      cypress: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      // --- Create sw.js via generateSW strategy ---
      // see https://vite-pwa-org.netlify.app/workbox/generate-sw
      // workbox: {
      //   runtimeCaching: [
      //     {
      //       // createTask
      //       urlPattern: ({ url }) => url.pathname.match('/task/'),
      //       method: 'POST',
      //       handler: 'NetworkOnly',
      //       options: {
      //         backgroundSync: {
      //           name: 'create-task-queue',
      //           options: {
      //             maxRetentionTime: 24 * 60, // Retry for up to 24 hours
      //           },
      //         },
      //       },
      //     },
      //   ],
      // },
      // --- Create own sw.js and inject ---
      // see https://vite-pwa-org.netlify.app/guide/inject-manifest.html
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
    }),
  ],
  build: {
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
      '@components': path.resolve(__dirname, './src/components'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
});
