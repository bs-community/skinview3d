import { defineConfig } from 'vite';

export default defineConfig({
	base: "./",
	root: "examples",
	build: {
		rollupOptions: {
			input: {
				app: './examples/index.html'
			},
		},
	},
});
