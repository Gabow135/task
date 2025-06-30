const webpack = require('webpack');
const path = require('path');

module.exports = function override(config) {
  config.resolve.fallback = {
    "fs": false,
    "path": false,
    "crypto": false,
  };
  
  // Ensure WASM files are handled correctly
  config.experiments = {
    ...config.experiments,
    asyncWebAssembly: true,
  };
  
  // Add rule for WASM files
  config.module.rules.push({
    test: /\.wasm$/,
    type: 'javascript/auto',
    use: {
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
        outputPath: 'static/js/',
        publicPath: process.env.NODE_ENV === 'production' 
          ? `${process.env.PUBLIC_URL || ''}/static/js/`
          : '/static/js/',
      },
    },
  });
  
  return config;
};