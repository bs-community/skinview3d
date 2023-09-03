/** if the browser supports WebGL */
export const isWebGLAvailable = () => {
	try {
		const canvas = document.createElement('canvas');
		return !!(
			window.WebGLRenderingContext &&
			(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
		);
	} catch (e) {
		return false;
	}
};
