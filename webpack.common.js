const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        bundle: path.resolve(__dirname, 'src/js/index.js')
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
        clean: true,
        assetModuleFilename: '[name].[ext]'
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.(png|svg|jpeg|jpeg|gif)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.glsl$/,
                use: 'webpack-glsl-loader'
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Fractal Erosion',
            filename: 'index.html',
            template: 'src/index.html'
        })
    ]
}