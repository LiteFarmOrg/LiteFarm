const svgrPlugin = require('vite-plugin-svgr');
const { Mode, plugin: mdPlugin } = require('vite-plugin-markdown');

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
    config.plugins.push(mdPlugin({ mode: [Mode.HTML, Mode.TOC, Mode.REACT] }));
    config.plugins.push(
      svgrPlugin({
        svgrOptions: {
          icon: false,
        },
      }),
    );
    return config;
  },
};
