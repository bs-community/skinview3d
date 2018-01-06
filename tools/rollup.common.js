import uglify from "rollup-plugin-uglify";
import { minify } from "uglify-es";
import babel from "rollup-plugin-babel";
let buildType = config => {
	let options = {
		input: "src/skinview3d.js",
		indent: "\t",
		sourcemap: true,
		external: ["three"],
		globals: {
			three: "THREE"
		},
		output: [
			{
				format: "umd",
				name: "skinview3d",
				file: `build/skinview3d${config.postfix}.js`
			},
			{
				format: "es",
				file: `build/skinview3d${config.postfix}.module.js`
			}
		],
		plugins: []
	};
	if (config.babel) {
		options.plugins.push(
			babel({
				exclude: "node_modules/**",
			})
		);
	}
	if (config.uglify) {
		options.plugins.push(
			uglify({
				output: {
					comments: (node, comment) => {
						let text = comment.value;
						let type = comment.type;
						if (type == "comment2") {
							// multiline comment
							return /@preserve|@license|@cc_on/i.test(text);
						}
					}
				}
			}, minify)
		);
	}
	return options;
};
export { buildType };
