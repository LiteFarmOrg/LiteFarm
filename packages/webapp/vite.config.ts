import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import svgrPlugin from 'vite-plugin-svgr';
import IstanbulPlugin from 'vite-plugin-istanbul';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    { enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react' }) },
    react(),
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
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        sourcemap: true,
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    port: 3000,
  },
});
