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
			file: 'build/skinview3d.js'
		},
		{
			format: 'es',
			file: 'build/skinview3d.module.js'
		}
	],
};
