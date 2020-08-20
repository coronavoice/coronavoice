const path = require('path');

module.exports = {
  configureWebpack: {
    resolve: {
      //allow for @ or @src alias for src
      alias: require('./aliases.config').webpack
    },
    module: {
      rules: [ // proper handle of .mjs files
        {
          type: 'javascript/auto',
          test: /\.mjs$/,
          loader: 'babel-loader'
        }
      ]
    }
  },
  chainWebpack: config => {
    //turn off elint for webpack transpile
    config.module.rules.delete('eslint');
  },
  runtimeCompiler: true,
  css: {
    sourceMap: true
  },
  publicPath: '',
  //build for docs folder to enable gh-pages hosting
  outputDir: './docs/',
  assetsDir: 'assets',
  pwa: {
    name: process.env.VUE_APP_NAME || 'thoughtcloud',
    themeColor: ('#' + process.env.VUE_APP_THEME_COLOR) || '#4192a1',
    msTileColor: '#fff',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: ('#' + process.env.VUE_APP_THEME_COLOR) || '#4192a1',
    manifestOptions: {
      background_color: ('#' + process.env.VUE_APP_THEME_COLOR) || '#4192a1'
    }
  }
}
