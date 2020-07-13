import { SkinViewer } from "./viewer";
import { Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function createOrbitControls(skinViewer: SkinViewer): OrbitControls {
	const control = new OrbitControls(skinViewer.camera, skinViewer.renderer.domElement);

	// default configuration
	control.enablePan = false;
	control.target = new Vector3(0, -12, 0);
	control.minDistance = 10;
	control.maxDistance = 256;
	control.update();

	return control;
}
