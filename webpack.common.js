const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    modLog: './src/views/components/mod/mod_log/hydrate.tsx',
  },
  module: {},
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'assets/dist_webpack'),
    clean: true,
  },
};
