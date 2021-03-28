const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());
// const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
	mode: "development",
    entry: path.resolve(appDirectory, "src/app.ts"), //path to the main .ts file
	output: {
		webassemblyModuleFilename: "[name].wasm",
        chunkFilename: '[id].[chunkhash].js',
        // filename: "bundle.js", //name for the js file that is created/compiled in memory
        // path: path.resolve(__dirname, "/public/assets/"),
        path: path.resolve(__dirname, "dist"),
		// publicPath: "/assets/"
        sourceMapFilename: "[name].js.map"
	},
    devtool: "eval-source-map",
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".wasm"],
        fallback: {
            "crypto": false,
            "fs": false,        
            "browser": false,
            "path": false,
        }
    },
    devServer: {
        host: "localhost",
        port: 8080, //port that we're using for local host (localhost:8080)
        disableHostCheck: true,
        // contentBase: __dirname + "/public/",
        contentBase: path.resolve(appDirectory, "public"), //tells webpack to serve from the public folder
        // publicPath: "/",
        hot: true,
    },
	module: {
		rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            // {
            //     test: /\.wasm$/,
            //     use: 'file-loader',
            //     // type: 'javascript/auto',
            //     include: path.resolve(__dirname, 'src'),
            // },            
			{
                test: /\.wasm?$/,
				type: "webassembly/async"
			},
            {
                test: /\.ifc?$/,
                use: 'raw-loader',
            },
            // {
            //     test: /\.(wasm)$/,
            //     loader: 'file-loader',
            //     type: 'javascript/auto',
            // },
        ]
	},
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(appDirectory, "public/index.html"),
        }),
        // new WasmPackPlugin({
        //     crateDirectory: path.resolve(__dirname, ".")
        // }),
        new CleanWebpackPlugin(),
    ],
	optimization: {
		chunkIds: "deterministic" // To keep filename consistent between different modes (for example building only)
	},
	experiments: {
		syncWebAssembly: true
	}
};