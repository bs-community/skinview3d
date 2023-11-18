/** if the browser supports WebGL */
export const isWebGLAvailable = () => {
	try {
		const canvas = document.createElement("canvas");
		const hasWebGl = !!(
			window.WebGLRenderingContext &&
			(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
		);

		// cleanup the canvas
		canvas.remove();

		return hasWebGl;
	} catch (e) {
		return false;
	}
};
