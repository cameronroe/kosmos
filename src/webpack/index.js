import path, { resolve, join } from 'path'
import autoprefixer from 'autoprefixer'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
import WebpackMd5Hash from 'webpack-md5-hash'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'

//=========================================================
//  ENVIRONMENT VARS
//---------------------------------------------------------
const NODE_ENV = process.env.NODE_ENV

const ENV_DEVELOPMENT = NODE_ENV === 'development'
const ENV_PRODUCTION = NODE_ENV === 'production'
const ENV_TEST = NODE_ENV === 'test'

const HOST = '0.0.0.0'
const PORT = 3000

export default async function createCompiler(dir, { hotReload = false }) {
    
  const config = {}
  const kosmosModules = resolve(__dirname, '../../node_modules')
  
  //=========================================================
  //  LOADERS
  //---------------------------------------------------------
  const loaders = {
    js: {
      test: /\.js$/, 
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: [
          'latest',
          'react',
          'stage-0'
        ],
        plugins: [
          require.resolve('babel-plugin-react-require'),
          [require.resolve('babel-plugin-module-resolver'), 
            {
              root: [resolve(__dirname, '../../node_modules')],
              alias: {
                react: require.resolve('react'),
                // 'next/link': require.resolve('../../lib/link'),
                // 'next/css': require.resolve('../../lib/css'),
                // 'next/head': require.resolve('../../lib/head')
              }
            }
          ]
        ]
      }
    },
    scss: {
      test: /\.scss$/, 
      loader: 'style-loader!css-loader!postcss-loader!sass-loader'
    }
  }
  
  // Resolve
  //---------------------------------------------------------
  config.resolve = {
    extensions: ['.js', '.scss', '.json'],
    root: [kosmosModules, dir, 'src', 'node_modules']
  }
  
  config.resolveLoader = {
    root: [
      kosmosModules,
      join(__dirname, 'loaders')
    ]
  }

  config.sassLoader = {
    outputStyle: 'compressed',
    precision: 10,
    sourceComments: false
  }

  config.postcss = [
    autoprefixer({ browsers: ['last 3 versions'] })
  ]
  
  //  Plugins
  //---------------------------------------------------------
  config.plugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
    })
  ]

  //=====================================
  //  DEVELOPMENT or PRODUCTION
  //-------------------------------------
  if (ENV_DEVELOPMENT || ENV_PRODUCTION) {

    //  Entry
    //---------------------------------------------------------
    config.entry = {
      main: ['./src/index']
    }

    config.output = {
      path: join(dir, '.kosmos'),
      filename: '[name].js',
      publicPath: '/'
    }

    // config.plugins.push(
    //   new HtmlWebpackPlugin({
    //     chunkSortMode: 'dependency',
    //     filename: 'index.html',
    //     hash: false,
    //     inject: 'body',
    //     template: './src/index.html'
    //   })
    // )
  }


  //=====================================
  //  DEVELOPMENT
  //-------------------------------------
  if (ENV_DEVELOPMENT) {
    config.devtool = 'cheap-module-source-map'

    config.entry.main.unshift(
      'babel-polyfill',
      `webpack-dev-server/client?http://${HOST}:${PORT}`,
      'webpack/hot/only-dev-server',
      'react-hot-loader/patch'
    )
    
    //  Loaders
    //---------------------------------------------------------
    config.module = {
      loaders: [
        loaders.js,
        loaders.scss
      ]
    }

    config.externals = [
      'react',
      'react-dom',
      {
        [require.resolve('react')]: 'react',
        // [require.resolve('../../lib/link')]: 'next/link',
        // [require.resolve('../../lib/css')]: 'next/css',
        // [require.resolve('../../lib/head')]: 'next/head'
      }
    ]
    
    //  Plugins
    //---------------------------------------------------------
    if (hotReload) {
      config.plugins.push(
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new FriendlyErrorsWebpackPlugin()
      )
    }
    
    //  Dev Server
    //---------------------------------------------------------
    // config.devServer = {
    //   contentBase: './src',
    //   historyApiFallback: true,
    //   host: HOST,
    //   hot: true,
    //   port: PORT,
    //   publicPath: config.output.publicPath,
    //   stats: {
    //     cached: true,
    //     cachedAssets: true,
    //     chunks: true,
    //     chunkModules: false,
    //     colors: true,
    //     hash: false,
    //     reasons: true,
    //     timings: true,
    //     version: false
    //   }
    // }
  }


  //=====================================
  //  PRODUCTION
  //-------------------------------------
  // if (ENV_PRODUCTION) {
  //   config.devtool = 'source-map'

  //   config.entry.vendor = './src/vendor.js'

  //   config.output.filename = '[name].[chunkhash].js'

  //   config.module = {
  //     loaders: [
  //       loaders.js,
  //       {test: /\.scss$/, loader: ExtractTextPlugin.extract('css?-autoprefixer!postcss!sass')}
  //     ]
  //   }

  //   config.plugins.push(
  //     new WebpackMd5Hash(),
  //     new ExtractTextPlugin('styles.[contenthash].css'),
  //     new webpack.optimize.CommonsChunkPlugin({
  //       name: 'vendor',
  //       minChunks: Infinity
  //     }),
  //     new webpack.optimize.DedupePlugin(),
  //     new webpack.optimize.UglifyJsPlugin({
  //       mangle: true,
  //       compress: {
  //         dead_code: true, // eslint-disable-line camelcase
  //         screw_ie8: true, // eslint-disable-line camelcase
  //         unused: true,
  //         warnings: false
  //       }
  //     })
  //   )
  // }


  //=====================================
  //  TEST
  //-------------------------------------
  // if (ENV_TEST) {
  //   config.devtool = 'inline-source-map'

  //   config.module = {
  //     loaders: [
  //       loaders.js,
  //       loaders.scss
  //     ]
  //   }
  // }

  return {
    config,
    compiler: webpack(config)
  }

}