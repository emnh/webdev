const path = require('path');

module.exports = {
  entry: './client/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  devServer: {
    index: 'default.html',
    contentBase: path.join(__dirname, "."),
    compress: true,
    port: 8080,
    proxy: {
      '/api': 'http://localhost:8081'
    }
  },
  plugins: [
    /* new UglifyJsPlugin()*/
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.txt$/,
        use: 'raw-loader'
      }
    ]
  }
};
