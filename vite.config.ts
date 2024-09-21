import { defineConfig } from 'vite';

export default defineConfig({
	base: "./examples/",
	build: {
		rollupOptions: {
			input: {
				app: './examples/index.html'
			},
		},
	},
});
