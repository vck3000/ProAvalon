/* eslint-disable */
const withCSS = require('@zeit/next-css');

module.exports = withCSS({
  webpack: (config, { dev }) => {
    if (dev) {
      config.module.rules.push({
        test: /\.(js|ts|jsx|tsx)?$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
      });
      config.module.rules.push({
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 100000,
            name: '[name].[ext]',
          },
        },
      });
    }
    return config;
  },

  webpackDevMiddleware: (config) => {
    // eslint-disable-next-line no-param-reassign
    config.watchOptions = {
      poll: 500,
      aggregateTimeout: 300,
    };

    return config;
  },

  // We need these config because inside the docker network, we refer to the backend server by the docker url
  // But from the client side, we cannot directly access the docker network, and instead have to rely on the
  // docker ports being open to our localhost.
  // Note: To avoid the backend having to block and load in the data in getInitialProps, we can use SWR
  // to load it on the client side. This way we retain our fast static page with client side loading afterward.
  // Good for stuff like dashboards where the shell of the page is enough to get started and serve as SEO material.
  serverRuntimeConfig: {
    // Will only be available on the server side
    apiUrl: 'http://backend:3001',
  },

  publicRuntimeConfig: {
    // Will be available on both server and client
    apiUrl: process.env.BACKEND_URL,
  },
});
