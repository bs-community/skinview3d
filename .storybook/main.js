module.exports = {
	stories: ["../examples/**/*.stories.js"],
	addons: ["@storybook/addon-knobs/register"],
	webpackFinal: (config) => {
		config.module.rules.push({
			test: /\.ts/,
			use: [
				{
					loader: require.resolve("ts-loader"),
				},
			],
		});
		config.resolve.extensions.push(".ts");
		return config;
	},
};
