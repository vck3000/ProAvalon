const path = require('path');

module.exports = {
  entry: {
    modLog: './src/views/components/mod/mod_log/hydrate.tsx',
    report: './src/views/components/report/hydrate.tsx',
    reportLog: './src/views/components/mod/report/hydrate.tsx',
    timer: './src/views/components/timer/hydrate.tsx',
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
