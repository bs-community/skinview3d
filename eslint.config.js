import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsdocPlugin from "eslint-plugin-tsdoc";

export default [
	{
		ignores: ["libs/**/*", "bundles/**/*"],
	},
	{
		files: ["**/*.ts"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
			tsdoc: tsdocPlugin,
		},
		rules: {
			indent: ["error", "tab"],
			"no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
			"@typescript-eslint/no-inferrable-types": "off",
			"@typescript-eslint/no-empty-interface": "off",
			"@typescript-eslint/no-non-null-assertion": "warn",
			"tsdoc/syntax": "warn",
		},
	},
];
