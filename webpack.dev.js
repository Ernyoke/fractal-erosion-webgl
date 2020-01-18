const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    devtool: 'sourcemap',
    devServer: {
        contentBase: path.resolve(__dirname, 'build'),
        compress: true,
        inline: true,
        hot: true,
        quiet: false,
        port: 4200,
        historyApiFallback: true,
        stats: {
            chunks: false,
            chunkModules: false
        }
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]
});
