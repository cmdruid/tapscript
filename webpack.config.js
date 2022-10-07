const path = import.meta.url.split('/').slice(2, -1).join('/')

const config = {
  mode: 'production',
  entry: './index.js',

  // module: {
  //   rules: [
  //     {
  //       test: /\.ts$/,
  //       use: 'ts-loader',
  //       exclude: /node_modules/
  //     }
  //   ]
  // },

  // resolve: {
  //   extensions: ['.ts', '.js']
  // },

  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },

  output: {
    path: path + '/dist',
    filename: 'bton.js',
    library: 'BTON',
    libraryExport: 'default',
    libraryTarget: 'umd'
  }
}

export default config
