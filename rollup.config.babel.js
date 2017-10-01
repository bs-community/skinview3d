import babel from 'rollup-plugin-babel';

export default {
	input: 'src/skinview3d.js',
	indent: '\t',
	sourcemap: true,
	external: ['three'],
	globals: {
		three: 'THREE'
	},
	output: [
		{
			format: 'umd',
			name: 'skinview3d',
			file: 'build/skinview3d.babel.js'
		},
		{
			format: 'es',
			file: 'build/skinview3d.babel.module.js'
		}
	],
	plugins: [
		babel({
			exclude: 'node_modules/**',
		}),
	]
};
