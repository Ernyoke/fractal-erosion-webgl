const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        })
    ]
});
