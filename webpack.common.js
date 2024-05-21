const path = require('path');

module.exports = {
  entry: {
    avatarHome: './src/views/components/avatarHome/hydrate.tsx',
    modLog: './src/views/components/mod/mod_log/hydrate.tsx',
    matchmakingUi: './src/views/components/matchmakingUi/hydrate.tsx',
    readyPrompt: './src/views/components/readyPrompt/hydrate.tsx',
    report: './src/views/components/report/hydrate.tsx',
    reportLog: './src/views/components/mod/report/hydrate.tsx',
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
  optimization: {
    runtimeChunk: 'single',
  },
};
