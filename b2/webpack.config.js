const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {

  entry: './index.html',
  output: {
    filename: 'bundle.js',
  },
    plugins: [new HtmlWebpackPlugin()],

    module: {
    rules: [
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
    ],
  },
};
