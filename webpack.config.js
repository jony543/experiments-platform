const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devServer: {
        port: 3001,
    },
    entry: './src/client/index.tsx',
    output: {
        path: path.join(__dirname, '/dist/client'),
        publicPath: '/admin',
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
    plugins: [new HtmlWebpackPlugin({template: './src/client/index.html'})],
}