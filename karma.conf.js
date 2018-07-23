/* eslint-env node */

process.env.CHROME_BIN = require("puppeteer").executablePath();

module.exports = function (config) {
	config.set({
		basePath: "",
		frameworks: ["mocha"],
		files: [
			"test/test.ts"
		],
		exclude: [],
		preprocessors: {
			"test/test.ts": ["webpack"]
		},
		webpack: {
			mode: "development",
			module: {
				rules: [
					{
						test: /\.png$/i,
						loader: "url-loader"
					},
					{
						test: /\.ts$/,
						loader: "ts-loader",
						options: {
							transpileOnly: true
						}
					}
				]
			},
			resolve: {
				extensions: [".ts", ".js", ".json"]
			}
		},
		webpackMiddleware: {
			stats: "errors-only"
		},
		mime: {
			"text/x-typescript": ["ts"]
		},
		reporters: ["progress"],
		port: 9876,
		colors: true,
		logLevel: config.LOG_WARN,
		autoWatch: false,
		browsers: [process.env.TRAVIS ? "ChromeHeadlessNoSandbox" : "ChromeHeadless"],
		customLaunchers: {
			ChromeHeadlessNoSandbox: {
				base: "ChromeHeadless",
				flags: ["--no-sandbox"]
			}
		},
		singleRun: true,
		concurrency: Infinity
	});
};
