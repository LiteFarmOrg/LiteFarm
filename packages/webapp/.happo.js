const { RemoteBrowserTarget } = require('happo.io');

module.exports = {
  apiKey: process.env.REACT_APP_HAPPO_API_KEY,
  apiSecret: process.env.REACT_APP_HAPPO_SECRET,
  targets: {
    safari: new RemoteBrowserTarget('ios-safari', {
      viewport: '375x667',
    }),
  },
};
