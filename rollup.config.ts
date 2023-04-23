import { defineConfig } from "rollup";
import { swc } from "rollup-plugin-swc3";
import resolve from "@rollup/plugin-node-resolve";
import { threeMinifier } from "@yushijinhun/three-minifier-rollup";

export default defineConfig({
	input: "src/skinview3d.ts",
	output: {
		file: "bundles/skinview3d.bundle.js",
		format: "umd",
		name: "skinview3d",
		banner:
			"/* @preserve skinview3d / MIT License / https://github.com/bs-community/skinview3d */",
		sourcemap: true,
		compact: true,
	},
	plugins: [
		threeMinifier(),
		resolve(),
		swc({
			jsc: { minify: { compress: true, mangle: true, sourceMap: true } },
			minify: true,
			sourceMaps: true,
		}),
	],
});
