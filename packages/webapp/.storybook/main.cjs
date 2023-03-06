module.exports = {
  stories: ['../src/stories/**/*.stories.mdx', '../src/stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/jest',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  features: {
    storyStoreV7: true,
  },
  async viteFinal(config) {
    return {
      ...config,
      plugins: [...config.plugins.filter((plugin) => !['@mdx-js/rollup'].includes(plugin.name))],
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [...(config.optimizeDeps?.include ?? []), '@storybook/addon-docs/blocks'],
      },
    };
  },
  docs: {
    autodocs: true,
  },
};
