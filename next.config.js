/* eslint-disable */
module.exports = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.module.rules.push({
        test: /\.(js|ts|jsx|tsx)?$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      });
    }
    return config;
  },

  webpackDevMiddleware: config => {
    // eslint-disable-next-line no-param-reassign
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300
    };

    return config;
  }
};
