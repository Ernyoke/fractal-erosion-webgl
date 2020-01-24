const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


module.exports = {
    cache: true,
    context: __dirname,
    performance: {
        hints: false
    },
    entry: ['./src/js/index.js'],
    output: {
        filename: '[name].bundle-[hash]-[id].js',
        path: path.resolve(__dirname, 'dist'),
    },
    optimization: {
        minimizer: [new UglifyJsPlugin({
            sourceMap: true,
            uglifyOptions: {
                ie8: false,
                mangle: true,
                toplevel: false,
                compress: {
                    booleans: true,
                    conditionals: true,
                    dead_code: true,
                    drop_debugger: true,
                    drop_console: true,
                    evaluate: true,
                    sequences: true,
                    unused: true
                },
                output: {
                    comments: false,
                    beautify: false,
                }
            }
        })]
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: function () {
                                return [
                                    require('precss'),
                                    require('autoprefixer')
                                ];
                            }
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sassOptions: {
                                includePaths: ['./node_modules']
                            }
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [['@babel/preset-env',
                                {
                                    useBuiltIns: "usage",
                                    corejs: 3,
                                    targets: {
                                        browsers: ['defaults']
                                    }
                                }]]
                        }
                    }
                ]
            },
            {
                test: /\.glsl$/,
                use: 'webpack-glsl-loader'
            },
            {
                test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: 'url-loader?limit=10000',
            },
            {
                test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
                use: 'file-loader',
            },
            {
                test: /\.html$/,
                use: ['html-loader']
            },
            {
                test: /\.(png|jpg|svg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'img/',
                            publicPath: 'img/'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/index.html'),
            minify: false,
            inject: 'body',
            hash: false
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin(),
    ]
};
