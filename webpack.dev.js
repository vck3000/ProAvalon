const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [/node_modules/, /assets/],
      },
    ],
  },
  devtool: 'inline-source-map',
  devServer: {
    static: {
      publicPath: './assets/dist_webpack',
    },
    compress: true,
    port: 3010,
    hot: true,
    devMiddleware: {
      writeToDisk: true,
      publicPath: '/dist_webpack/',
    },
  },
  optimization: {
    runtimeChunk: 'single',
  },
});
