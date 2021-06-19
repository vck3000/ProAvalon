const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './assets/dist_webpack',
    compress: true,
    publicPath: '/dist_webpack/',
    port: 3010,
    hot: true,
  },
});
