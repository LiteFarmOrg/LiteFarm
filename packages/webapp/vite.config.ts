import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from 'vite-plugin-mdx';
// @ts-ignore
import svgrPlugin from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
      jsxRuntime: mode === 'development' ? 'automatic' : 'classic',
    }),
    mdx(),
    svgrPlugin({
      svgrOptions: {
        icon: false,
      },
    }),
  ],
  build: {
    sourcemap: true,
  },
}));
