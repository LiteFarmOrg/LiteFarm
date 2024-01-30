import { defineConfig } from 'vite';
import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react';
import path from 'path';
import istanbul from 'vite-plugin-istanbul';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['@mui/material/Tooltip'],
  },
  plugins: [
    { enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react' }) },
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    svgr({
      svgrOptions: {
        icon: false,
      },
      include: '**/*.svg?react',
    }),
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'tests/'],
      extension: ['.js', '.ts', '.jsx'],
      requireEnv: true,
      cypress: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
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
    },
  },
});
