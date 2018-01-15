import uglify from "rollup-plugin-uglify";
import { minify } from "uglify-es";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";

let buildType = config => {
	let options = {
		input: "src/skinview3d.js",
		indent: "\t",
		sourcemap: true,
		output: [],
		external:[
			"three"
		],
		globals: {
			"three": "THREE"
		},
		plugins: [
			resolve()
		]
	};

	switch (config.format) {
		case "umd":
			options.output.push({
				format: "umd",
				name: "skinview3d",
				file: `build/skinview3d${config.postfix}.js`
			});
			break;

		case "es":
			options.output.push({
				format: "es",
				file: `build/skinview3d${config.postfix}.js`
			});
			break;

		default:
			throw `Unknown format: ${config.format}`;
	}

	if (config.babel) {
		options.plugins.push(
			babel({
				exclude: "node_modules/**"
			})
		);
	}

	if (config.uglify) {
		options.plugins.push(
			uglify({
				output: {
					comments: "some"
				}
			}, minify)
		);
	}
	return options;
};
export { buildType };
