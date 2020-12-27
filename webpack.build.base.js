const path = require('path');
const webpack = require('webpack');

module.exports = {

    mode: process.env.WEBPACK_DEV_SERVER ? 'development' : 'production',

    devtool:  'source-map',

    entry: {
        'main': path.resolve(__dirname, './src/molpad.tsx')
    },

    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: "[name].js",
        libraryTarget: 'umd',
        library: 'molpad',
        umdNamedDefine: true
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
    ],
    module: {
        rules: [
            { test: /\.(woff|woff2|ttf|eot)/, loader: ['url-loader?limit=1'] },
            { test: /\.png$/, loader: 'url-loader?limit=10000&mimetype=image/png' },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    // 'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader',
                ],
            },
            {
                test: /\.css$/i,
                use: [
                    // 'style-loader',
                    'css-loader'
                ],
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                loader: 'awesome-typescript-loader'
            }
        ]
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.svg']
    }
}
