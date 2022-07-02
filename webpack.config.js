const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
require('dotenv').config({ path: './.env' });
const webpack = require('webpack');

const appBase = `${process.env.APP_PREFIX || ''}/admin`

module.exports = {
    devServer: {
        port: 3333,
        historyApiFallback: {
            index: appBase,
        }
    },
    entry: './src/client/index.tsx',
    output: {
        path: path.join(__dirname, '/dist/client'),
        publicPath: appBase,
    },
    // optimization
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false,
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                include: path.resolve(__dirname, 'src'),
            },
            {
                test: /\.(s[ac]ss|css)$/i,
                use: ['style-loader', 'css-loader', 'sass-loader'],
                include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'node_modules/antd/dist/antd.css'),
                ]
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({ template: './src/client/index.html' }),
        new webpack.DefinePlugin({
            APP_PREFIX: JSON.stringify(process.env.APP_PREFIX || ''),
            DISABLE_REGISTRATION: JSON.stringify(process.env.DISABLE_REGISTRATION || false),
        }),
        new CopyPlugin({
            patterns: [
                { from: "./src/client/assets", to: "assets" },
            ],
        }),
    ],
}