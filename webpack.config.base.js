const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',

    devtool:  'source-map',

    entry: {
        'molpad': path.resolve(__dirname, 'src/molpad')
    },

    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: "[name].js",
        libraryTarget: 'umd',
        library: 'molpad',
        umdNamedDefine: true
    },

    externals: [{
       'react': true
    }],

    module: {
        rules: [{
            test: /\.(ts|tsx)$/,
            exclude: /(bower_components|node_modules)/,
            loader: 'awesome-typescript-loader'
        }, {
            test: /\.less$/,
            use: [{
                loader: "style-loader"
            }, {
                loader: "css-loader"
            }, {
                loader: "postcss-loader"
            }, {
                loader: "less-loader"
            }]
        }, {
            test: /\.css$/,
            use: [{
                loader: "style-loader"
            }, {
                loader: "css-loader"
            }, {
                loader: "postcss-loader"
            }]
        },
        {
          test: /\.(woff|woff2|ttf|eot)/,
          loader: 'file-loader?limit=1'
        }, {
          test: /\.svg$/,
          loader: 'url-loader?limit=26000&mimetype=image/svg+xml'
        }]
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        })
    ],

    resolve: {
        extensions: ['.ts', '.js', '.tsx',  '.less']
    }
};
