import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ['src/tests/**/*.test.js?(x)'],
      environment: 'happy-dom',
    },
  }),
);
