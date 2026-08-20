import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import IstanbulPlugin from 'vite-plugin-istanbul';
import { VitePWA } from 'vite-plugin-pwa';
import svgrPlugin from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
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
      includeAssets: ['crop-images/default.jpg'],
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg}'],
        globIgnores: ['**/survey-vendor-*.js'],
        maximumFileSizeToCacheInBytes: 3 * 1024 ** 2, // 3MB
      },
    }),
  ],
  build: {
    sourcemap: true,
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // separate out the shared React dependencies that would otherwise be bundled with 'survey-vendor' and cause it to be loaded from main entrypoint
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/scheduler/')
          ) {
            return 'framework-vendor';
          }

          if (
            id.includes('/node_modules/survey-core/') ||
            id.includes('/node_modules/survey-react-ui/')
          ) {
            return 'survey-vendor';
          }

          if (
            id.includes('/node_modules/recharts/') ||
            id.includes('/node_modules/chart.js/') ||
            id.includes('/node_modules/react-chartjs-2/') ||
            id.includes('/node_modules/@kurkle/color/') ||
            id.includes('/node_modules/react-smooth/') ||
            id.includes('/node_modules/decimal.js-light/') ||
            id.includes('/node_modules/victory-vendor/') ||
            id.includes('/node_modules/d3-')
          ) {
            return 'charts-vendor';
          }

          if (id.includes('/node_modules/react-redux-form/')) {
            return 'react-redux-form-vendor';
          }

          if (
            id.includes('/node_modules/@mui/material/') ||
            id.includes('/node_modules/@mui/system/') ||
            id.includes('/node_modules/@mui/base/') ||
            id.includes('/node_modules/@mui/utils/') ||
            id.includes('/node_modules/@mui/styles/') ||
            id.includes('/node_modules/@mui/styled-engine/') ||
            id.includes('/node_modules/@mui/private-theming/') ||
            id.includes('/node_modules/@emotion/') ||
            id.includes('/node_modules/react-select/') ||
            id.includes('/node_modules/@reduxjs/toolkit/') ||
            id.includes('/node_modules/react-redux/') ||
            id.includes('/node_modules/redux/') ||
            id.includes('/node_modules/redux-persist/') ||
            id.includes('/node_modules/redux-saga/') ||
            id.includes('/node_modules/reselect/') ||
            id.includes('/node_modules/immer/') ||
            id.includes('/node_modules/moment/')
          ) {
            return 'app-vendor';
          }

          return undefined;
        },
      },
    },
  },

  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
      '@components': path.resolve(__dirname, './src/components'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@navStyles': path.resolve(__dirname, './src/containers/Navigation/styles.module.scss'),
    },
  },
});
