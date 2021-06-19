const path = require('path');

module.exports = (env) => {
  return {
    mode: 'development',
    entry: {
      modLog: './src/views/components/mod/mod_log/hydrate.tsx',
    },
    devtool: 'inline-source-map',
    devServer: {
      contentBase: './assets/dist_webpack',
      compress: true,
      publicPath: '/dist_webpack/',
      port: 3010,
      hot: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: [/node_modules/, /assets/],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'assets/dist_webpack'),
      clean: true,
    },
  };
};
