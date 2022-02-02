import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from 'vite-plugin-mdx';
// @ts-ignore
import svgrPlugin from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    mdx(),
    svgrPlugin({
      svgrOptions: {
        icon: false,
      },
    }),
  ],
});

