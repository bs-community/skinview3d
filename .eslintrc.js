module.exports = {
	"root": true,
	"env": {
		"es6": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaVersion": "2018",
		"sourceType": "module"
	},
	"rules": {
		"indent": [
			"warn",
			"tab",
			{
				"SwitchCase": 1
			}
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		],
		"no-console": [
			"error",
			{
				allow: ["warn", "error"]
			}
		],
		"no-unused-vars": [
			"error",
			{
				"args": "none"
			}
		]
	}
};
