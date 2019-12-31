import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import license from "rollup-plugin-license";

const umd = {
	format: "umd",
	name: "skinview3d",
	indent: "\t",
	globals: {
		"three": "THREE"
	}
};

const es = {
	format: "es",
	indent: "\t"
};

const resolverPlugin = {
	name: "resolver",
	resolveId: id => id.startsWith("three/src/") ? "three" : undefined
};

const licensePlugin = license({
	banner: `
				skinview3d (https://github.com/bs-community/skinview3d)

				MIT License
				`
});

const base = {
	input: "src/skinview3d.ts",
	external: [
		"three"
	]
};

export default [
	{
		...base,
		output: [
			{ ...umd, file: "dist/skinview3d.js" },
			{ ...es, file: "dist/skinview3d.module.js" }
		],
		plugins: [
			resolverPlugin,
			resolve(),
			typescript(),
			licensePlugin
		]
	},
	{
		...base,
		output: { ...umd, file: "dist/skinview3d.min.js" },
		plugins: [
			resolverPlugin,
			resolve(),
			typescript(),
			terser(),
			licensePlugin
		]
	}
];
