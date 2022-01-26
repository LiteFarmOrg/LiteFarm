import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdPlugin, { Mode } from 'vite-plugin-markdown';
// @ts-ignore
import svgrPlugin from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    mdPlugin({ mode: [Mode.HTML, Mode.TOC, Mode.REACT] }),
    svgrPlugin({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
});

