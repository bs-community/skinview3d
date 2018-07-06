/* eslint-env node */

process.env.CHROME_BIN = require("puppeteer").executablePath();

module.exports = function (config) {
	config.set({
		basePath: "",
		frameworks: ["mocha"],
		files: [
			"test/test.js"
		],
		exclude: [],
		preprocessors: {
			"test/test.js": ["webpack"]
		},
		webpack: {
			mode: "development",
			module: {
				rules: [
					{
						test: /\.png$/i,
						loader: "url-loader"
					}
				]
			}
		},
		webpackMiddleware: {
			stats: "errors-only"
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
