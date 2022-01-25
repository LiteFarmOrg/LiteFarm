import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore
import svgrPlugin from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
      },
    }),
    patchReactFloater()],
});

function patchReactFloater() {
  return {
    name: 'patch-react-floater',
    transform(code, id) {
      if (id.endsWith('react-floater/es/index.js')) {
        return `var global = typeof self !== undefined ? self : this;\n${code}`;
      }
    },
  };
}
