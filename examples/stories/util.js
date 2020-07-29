/* eslint-disable */
import * as skinview3d from "../..";

export const createViewer = (config) => {
	const width = config?.width || 300;
	const height = config?.height || 400;

	const element = document.createElement("div");
	const viewer = new skinview3d.SkinViewer(element, {
		width: width,
		height: height,
		skin: "textures/1_8_texturemap_redux.png",
	});

	const control = skinview3d.createOrbitControls(viewer);
	control.enableRotate = true;
	control.enableZoom = true;
	control.enablePan = true;

	return { viewer, element: viewer.domElement };
};
