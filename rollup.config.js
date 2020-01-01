import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import license from "rollup-plugin-license";

const base = {
	input: "src/skinview3d.ts",
	output: [
		{
			format: "umd",
			name: "skinview3d",
			file: "dist/skinview3d.js",
			indent: "\t",
			globals: {
				"three": "THREE"
			}
		},
		{
			format: "es",
			file: "dist/skinview3d.module.js",
			indent: "\t"
		}
	],
	external: [
		"three"
	],
	plugins: [
		resolve(),
		typescript(),
		license({
			banner: `
				skinview3d (https://github.com/bs-community/skinview3d)

				MIT License
				`
		})
	]
};

export default [
	base,
	Object.assign({}, base, {
		output: Object.assign({}, base.output[0], { file: "dist/skinview3d.min.js" }),
		plugins: (() => {
			const plugin = base.plugins.slice();
			plugin.splice(1, 0, terser());
			return plugin;
		})()
	})
];
