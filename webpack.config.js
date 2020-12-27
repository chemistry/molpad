const path = require('path');
const webpack = require('webpack');
const baseConfig = require('./webpack.config.base.js')
const HtmlWebpackPlugin = require('html-webpack-plugin');

console.log(path.resolve(__dirname, 'example/app.tsx'));

module.exports = Object.assign({}, baseConfig, {

    entry: {
        'molpad': path.resolve(__dirname, 'example/app.tsx')
    },

    externals: [{
    }],

    devtool: 'source-map',

    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'example/index.html'),
            favicon: path.resolve(__dirname, 'example/favicon.ico')
        })
    ]
});
