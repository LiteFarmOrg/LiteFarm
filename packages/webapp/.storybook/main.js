const svgrPlugin = require('vite-plugin-svgr');
const react = require('@vitejs/plugin-react');
module.exports = {
  stories: ['../src/stories/**/*.stories.mdx', '../src/stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: '@storybook/react',
  core: {
    builder: 'storybook-builder-vite',
  },
  features: {
    storyStoreV7: true,
  },
  async viteFinal(config, { configType }) {
    config.plugins = config.plugins.filter(
      (plugin) => !(Array.isArray(plugin) && plugin[0]?.name.includes('vite:react')),
    );
    return {
      ...config,
      plugins: [
        ...config.plugins,
        react({
          jsxRuntime: 'classic',
          exclude: [/\.stories\.(t|j)sx?$/, /node_modules/],
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
      ],
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [...(config.optimizeDeps?.include ?? []), '@storybook/addon-docs/blocks'],
      },
    };
  },
};
