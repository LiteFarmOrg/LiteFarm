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
    let fileLoader;
    let fileLoaderOption;
    config.node = { fs: 'empty', tls: 'empty', net: 'empty', module: 'empty', console: true };
    config.module.rules.map((rule) => {
      if (rule.test.test('.css')) {
        rule.use[1].options.modules = { localIdentName: '[path][name]__[local]--[hash:base64:5]' }
      }
    });
    config.module.rules.map((rule) => {
      if (rule.test.test('.svg')) {
        rule.test = /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/;
        fileLoader = rule.loader;
        fileLoaderOption = rule.options;
      }
    });
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
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        '@svgr/webpack',
        {
          loader: fileLoader,
          options: fileLoaderOption
        },
      ],
    });
    return config
  },
}
