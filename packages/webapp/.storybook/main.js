module.exports = {
  'stories': [
    '../src/stories/**/*.stories.mdx',
    '../src/stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  'addons': [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName: '[path][name]__[local]--[hash:base64:5]',
            },
          },
        },
        'sass-loader'],
    });
    config.module.rules.map((rule) => {
      if (rule.test.test('.css')){
       rule.use[1].options.modules={ localIdentName: '[path][name]__[local]--[hash:base64:5]'}
      }
    });
    return {
      ...config, resolve: {
        alias: {
          'core-js/modules': '@storybook/core/node_modules/core-js/modules',
          'core-js/features': '@storybook/core/node_modules/core-js/features',
        },
      },
    };
  },
}
