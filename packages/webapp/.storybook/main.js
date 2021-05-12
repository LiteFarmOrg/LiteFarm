module.exports = {
  stories: ['../src/stories/**/*.stories.mdx', '../src/stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/preset-create-react-app',
  ],
  webpackFinal: async (config, { configType }) => {
    config.node = { fs: 'empty', tls: 'empty', net: 'empty', module: 'empty', console: true };
    return config;
  },
};
