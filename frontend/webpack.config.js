// 環境変数を取得
require('dotenv').config({ path: './envVal.env' });

const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: { bundle: './src/index.tsx' },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  resolve: { extensions:['.ts','.tsx','.js'] },
  devServer: {
    static: { directory: path.join(__dirname, 'dist'),},
    port: 3000,
  },
  module: {
    rules: [
      { test: /\.(ts|tsx)$/,
        loader: 'ts-loader' },
      { test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]}
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.REACT_APP_WEBAPI_URL': JSON.stringify(process.env.REACT_APP_WEBAPI_URL),
    }),
  ]
}
