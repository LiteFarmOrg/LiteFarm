/// <reference types="vitest" />
import { UserConfig, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import svgrPlugin from 'vite-plugin-svgr';
import IstanbulPlugin from 'vite-plugin-istanbul';
import { VitePWA } from 'vite-plugin-pwa';

const allowedEnvVars = [
  'API_URL',
  'MINIO_ENDPOINT',
  'DEV_BUCKET_NAME',
  'DO_BUCKET_NAME',
  'OPEN_WEATHER_APP_ID',
  'GOOGLE_OAUTH_CLIENT_ID',
  'GOOGLE_API_KEY',
];

const buildDefine = (allowedEnvVars: string[]): Record<string, string> =>
  allowedEnvVars.reduce(
    (acc, envVar) => ({
      ...acc,
      [`import.meta.env.${envVar}`]: JSON.stringify(process.env[envVar]),
    }),
    {}
  );

export default defineConfig(async () => {
  const mdx = await import('@mdx-js/rollup');

  const viteConfig: UserConfig = {
    cacheDir: '../../node_modules/.vite/webapp',
    define: buildDefine(allowedEnvVars),
    optimizeDeps: {
      include: ['react/jsx-runtime'],
    },
    plugins: [
      {
        enforce: 'pre',
        ...mdx.default({ providerImportSource: '@mdx-js/react' }),
      },
      react(),
      nxViteTsPaths(),
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

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },

    server: {
      port: 3000,
      host: 'localhost',
    },
    preview: {
      port: 4300,
      host: 'localhost',
    },
    build: {
      sourcemap: true,
    },
    test: {
      globals: true,
      cache: {
        dir: '../../node_modules/.vitest',
      },
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
  };

  return viteConfig;
});
