import { EventDispatcher, MOUSE, OrthographicCamera, PerspectiveCamera, Quaternion, Spherical, Vector2, Vector3 } from "three";
import { SkinViewer } from "./viewer.js";

const STATE = {
	NONE: - 1,
	ROTATE: 0,
	DOLLY: 1,
	PAN: 2,
	TOUCH_ROTATE: 3,
	TOUCH_DOLLY: 4,
	TOUCH_PAN: 5
};

const CHANGE_EVENT = { type: "change" };
const START_EVENT = { type: "start" };
const END_EVENT = { type: "end" };
const EPS = 0.000001;

export class OrbitControls extends EventDispatcher {
	/**
	 * @preserve
	 * The code was originally from https://github.com/mrdoob/three.js/blob/d45a042cf962e9b1aa9441810ba118647b48aacb/examples/js/controls/OrbitControls.js
	 */
	/**
	 * @license
	 * Copyright (C) 2010-2017 three.js authors
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 *
	 *
	 * @author qiao / https://github.com/qiao
	 * @author mrdoob / http://mrdoob.com
	 * @author alteredq / http://alteredqualia.com/
	 * @author WestLangley / http://github.com/WestLangley
	 * @author erich666 / http://erichaines.com
	 */

	// This set of controls performs orbiting, dollying (zooming), and panning.
	// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
	//
	//    Orbit - left mouse / touch: one finger move
	//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
	//    Pan - right mouse, or arrow keys / touch: three finger swipe

	object: PerspectiveCamera | OrthographicCamera;
	domElement: HTMLElement;
	window: Window;

	// API
	enabled: boolean;
	target: Vector3;

	enableZoom: boolean;
	zoomSpeed: number;
	minDistance: number;
	maxDistance: number;
	enableRotate: boolean;
	rotateSpeed: number;
	enablePan: boolean;
	keyPanSpeed: number;
	autoRotate: boolean;
	autoRotateSpeed: number;
	minZoom: number;
	maxZoom: number;
	minPolarAngle: number;
	maxPolarAngle: number;
	minAzimuthAngle: number;
	maxAzimuthAngle: number;
	enableKeys: boolean;
	keys: { LEFT: number; UP: number; RIGHT: number; BOTTOM: number };
	mouseButtons: { ORBIT: MOUSE; ZOOM: MOUSE; PAN: MOUSE };
	enableDamping: boolean;
	dampingFactor: number;

	private spherical: Spherical;
	private sphericalDelta: Spherical;
	private scale: number;
	private target0: Vector3;
	private position0: Vector3;
	private zoom0: number;
	private state: number;
	private panOffset: Vector3;
	private zoomChanged: boolean;

	private rotateStart: Vector2;
	private rotateEnd: Vector2;
	private rotateDelta: Vector2;

	private panStart: Vector2;
	private panEnd: Vector2;
	private panDelta: Vector2;

	private dollyStart: Vector2;
	private dollyEnd: Vector2;
	private dollyDelta: Vector2;

	private updateLastPosition: Vector3;
	private updateOffset: Vector3;
	private updateQuat: Quaternion;
	private updateLastQuaternion: Quaternion;
	private updateQuatInverse: Quaternion;

	private panLeftV: Vector3;
	private panUpV: Vector3;
	private panInternalOffset: Vector3;

	private onContextMenu: (event: MouseEvent) => void;
	private onMouseUp: (event: MouseEvent) => void;
	private onMouseDown: (event: MouseEvent) => void;
	private onMouseMove: (event: MouseEvent) => void;
	private onMouseWheel: (event: MouseWheelEvent) => void;
	private onTouchStart: (event: TouchEvent) => void;
	private onTouchEnd: (event: TouchEvent) => void;
	private onTouchMove: (event: TouchEvent) => void;
	private onKeyDown: (event: KeyboardEvent) => void;

	constructor(object: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement, domWindow?: Window) {
		super();
		this.object = object;

		this.domElement = domElement;
		this.window = (domWindow !== undefined) ? domWindow : window;

		// Set to false to disable this control
		this.enabled = true;

		// "target" sets the location of focus, where the object orbits around
		this.target = new Vector3();

		// How far you can dolly in and out ( PerspectiveCamera only )
		this.minDistance = 0;
		this.maxDistance = Infinity;

		// How far you can zoom in and out ( OrthographicCamera only )
		this.minZoom = 0;
		this.maxZoom = Infinity;

		// How far you can orbit vertically, upper and lower limits.
		// Range is 0 to Math.PI radians.
		this.minPolarAngle = 0; // radians
		this.maxPolarAngle = Math.PI; // radians

		// How far you can orbit horizontally, upper and lower limits.
		// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
		this.minAzimuthAngle = - Infinity; // radians
		this.maxAzimuthAngle = Infinity; // radians

		// Set to true to enable damping (inertia)
		// If damping is enabled, you must call controls.update() in your animation loop
		this.enableDamping = false;
		this.dampingFactor = 0.25;

		// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
		// Set to false to disable zooming
		this.enableZoom = true;
		this.zoomSpeed = 1.0;

		// Set to false to disable rotating
		this.enableRotate = true;
		this.rotateSpeed = 1.0;

		// Set to false to disable panning
		this.enablePan = true;
		this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

		// Set to true to automatically rotate around the target
		// If auto-rotate is enabled, you must call controls.update() in your animation loop
		this.autoRotate = false;
		this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

		// Set to false to disable use of the keys
		this.enableKeys = true;

		// The four arrow keys
		this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

		// Mouse buttons
		this.mouseButtons = { ORBIT: MOUSE.LEFT, ZOOM: MOUSE.MIDDLE, PAN: MOUSE.RIGHT };

		// for reset
		this.target0 = this.target.clone();
		this.position0 = this.object.position.clone();
		this.zoom0 = this.object.zoom;

		// for update speedup
		this.updateOffset = new Vector3();
		// so camera.up is the orbit axis
		this.updateQuat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0));
		this.updateQuatInverse = this.updateQuat.clone().inverse();
		this.updateLastPosition = new Vector3();
		this.updateLastQuaternion = new Quaternion();

		this.state = STATE.NONE;
		this.scale = 1;

		// current position in spherical coordinates
		this.spherical = new Spherical();
		this.sphericalDelta = new Spherical();

		this.panOffset = new Vector3();
		this.zoomChanged = false;

		this.rotateStart = new Vector2();
		this.rotateEnd = new Vector2();
		this.rotateDelta = new Vector2();

		this.panStart = new Vector2();
		this.panEnd = new Vector2();
		this.panDelta = new Vector2();

		this.dollyStart = new Vector2();
		this.dollyEnd = new Vector2();
		this.dollyDelta = new Vector2();

		this.panLeftV = new Vector3();
		this.panUpV = new Vector3();
		this.panInternalOffset = new Vector3();

		// event handlers - FSM: listen for events and reset state

		this.onMouseDown = event => {
			if (this.enabled === false) return;
			event.preventDefault();
			if (event.button === this.mouseButtons.ORBIT) {
				if (this.enableRotate === false) return;
				this.rotateStart.set(event.clientX, event.clientY);
				this.state = STATE.ROTATE;
			} else if (event.button === this.mouseButtons.ZOOM) {
				if (this.enableZoom === false) return;
				this.dollyStart.set(event.clientX, event.clientY);
				this.state = STATE.DOLLY;
			} else if (event.button === this.mouseButtons.PAN) {
				if (this.enablePan === false) return;
				this.panStart.set(event.clientX, event.clientY);
				this.state = STATE.PAN;
			}

			if (this.state !== STATE.NONE) {
				document.addEventListener("mousemove", this.onMouseMove, false);
				document.addEventListener("mouseup", this.onMouseUp, false);
				this.dispatchEvent(START_EVENT);
			}
		};

		this.onMouseMove = event => {
			if (this.enabled === false) return;

			event.preventDefault();

			if (this.state === STATE.ROTATE) {
				if (this.enableRotate === false) return;
				this.rotateEnd.set(event.clientX, event.clientY);
				this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);

				// rotating across whole screen goes 360 degrees around
				this.rotateLeft(2 * Math.PI * this.rotateDelta.x / this.domElement.clientWidth * this.rotateSpeed);
				// rotating up and down along whole screen attempts to go 360, but limited to 180
				this.rotateUp(2 * Math.PI * this.rotateDelta.y / this.domElement.clientHeight * this.rotateSpeed);
				this.rotateStart.copy(this.rotateEnd);

				this.update();
			} else if (this.state === STATE.DOLLY) {

				if (this.enableZoom === false) return;

				this.dollyEnd.set(event.clientX, event.clientY);
				this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);

				if (this.dollyDelta.y > 0) {
					this.dollyIn(this.getZoomScale());
				} else if (this.dollyDelta.y < 0) {
					this.dollyOut(this.getZoomScale());
				}

				this.dollyStart.copy(this.dollyEnd);
				this.update();
			} else if (this.state === STATE.PAN) {

				if (this.enablePan === false) return;

				this.panEnd.set(event.clientX, event.clientY);
				this.panDelta.subVectors(this.panEnd, this.panStart);
				this.pan(this.panDelta.x, this.panDelta.y);
				this.panStart.copy(this.panEnd);
				this.update();
			}
		};

		this.onMouseUp = () => {
			if (this.enabled === false) return;
			document.removeEventListener("mousemove", this.onMouseMove, false);
			document.removeEventListener("mouseup", this.onMouseUp, false);

			this.dispatchEvent(END_EVENT);
			this.state = STATE.NONE;
		};

		this.onMouseWheel = event => {

			if (this.enabled === false || this.enableZoom === false || (this.state !== STATE.NONE && this.state !== STATE.ROTATE)) return;

			event.preventDefault();
			event.stopPropagation();

			if (event.deltaY < 0) {
				this.dollyOut(this.getZoomScale());
			} else if (event.deltaY > 0) {
				this.dollyIn(this.getZoomScale());
			}

			this.update();

			this.dispatchEvent(START_EVENT); // not sure why these are here...
			this.dispatchEvent(END_EVENT);
		};

		this.onKeyDown = event => {

			if (this.enabled === false || this.enableKeys === false || this.enablePan === false) return;

			switch (event.keyCode) {
				case this.keys.UP: {
					this.pan(0, this.keyPanSpeed);
					this.update();
					break;
				}
				case this.keys.BOTTOM: {
					this.pan(0, - this.keyPanSpeed);
					this.update();
					break;
				}
				case this.keys.LEFT: {
					this.pan(this.keyPanSpeed, 0);
					this.update();
					break;
				}
				case this.keys.RIGHT: {
					this.pan(- this.keyPanSpeed, 0);
					this.update();
					break;
				}
			}
		};

		this.onTouchStart = event => {
			if (this.enabled === false) return;

			switch (event.touches.length) {
				// one-fingered touch: rotate
				case 1: {
					if (this.enableRotate === false) return;

					this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
					this.state = STATE.TOUCH_ROTATE;
					break;
				}
				// two-fingered touch: dolly
				case 2: {
					if (this.enableZoom === false) return;

					const dx = event.touches[0].pageX - event.touches[1].pageX;
					const dy = event.touches[0].pageY - event.touches[1].pageY;

					const distance = Math.sqrt(dx * dx + dy * dy);
					this.dollyStart.set(0, distance);
					this.state = STATE.TOUCH_DOLLY;
					break;
				}
				// three-fingered touch: pan
				case 3: {
					if (this.enablePan === false) return;

					this.panStart.set(event.touches[0].pageX, event.touches[0].pageY);
					this.state = STATE.TOUCH_PAN;
					break;
				}
				default: {
					this.state = STATE.NONE;
				}
			}

			if (this.state !== STATE.NONE) {
				this.dispatchEvent(START_EVENT);
			}
		};

		this.onTouchMove = event => {
			if (this.enabled === false) return;
			event.preventDefault();
			event.stopPropagation();

			switch (event.touches.length) {
				// one-fingered touch: rotate
				case 1: {
					if (this.enableRotate === false) return;
					if (this.state !== STATE.TOUCH_ROTATE) return; // is this needed?...

					this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
					this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);

					// rotating across whole screen goes 360 degrees around
					this.rotateLeft(2 * Math.PI * this.rotateDelta.x / this.domElement.clientWidth * this.rotateSpeed);

					// rotating up and down along whole screen attempts to go 360, but limited to 180
					this.rotateUp(2 * Math.PI * this.rotateDelta.y / this.domElement.clientHeight * this.rotateSpeed);

					this.rotateStart.copy(this.rotateEnd);

					this.update();
					break;
				}
				// two-fingered touch: dolly
				case 2: {
					if (this.enableZoom === false) return;
					if (this.state !== STATE.TOUCH_DOLLY) return; // is this needed?...

					// console.log( "handleTouchMoveDolly" );
					const dx = event.touches[0].pageX - event.touches[1].pageX;
					const dy = event.touches[0].pageY - event.touches[1].pageY;

					const distance = Math.sqrt(dx * dx + dy * dy);

					this.dollyEnd.set(0, distance);

					this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);

					if (this.dollyDelta.y > 0) {
						this.dollyOut(this.getZoomScale());
					} else if (this.dollyDelta.y < 0) {
						this.dollyIn(this.getZoomScale());
					}

					this.dollyStart.copy(this.dollyEnd);
					this.update();
					break;
				}
				// three-fingered touch: pan
				case 3: {
					if (this.enablePan === false) return;
					if (this.state !== STATE.TOUCH_PAN) return; // is this needed?...
					this.panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
					this.panDelta.subVectors(this.panEnd, this.panStart);
					this.pan(this.panDelta.x, this.panDelta.y);
					this.panStart.copy(this.panEnd);
					this.update();
					break;
				}
				default: {
					this.state = STATE.NONE;
				}
			}
		};

		this.onTouchEnd = () => {
			if (this.enabled === false) return;
			this.dispatchEvent(END_EVENT);
			this.state = STATE.NONE;
		};

		this.onContextMenu = event => {
			event.preventDefault();
		};

		this.domElement.addEventListener("contextmenu", this.onContextMenu, false);

		this.domElement.addEventListener("mousedown", this.onMouseDown, false);
		this.domElement.addEventListener("wheel", this.onMouseWheel, false);

		this.domElement.addEventListener("touchstart", this.onTouchStart, false);
		this.domElement.addEventListener("touchend", this.onTouchEnd, false);
		this.domElement.addEventListener("touchmove", this.onTouchMove, false);

		this.window.addEventListener("keydown", this.onKeyDown, false);

		// force an update at start
		this.update();
	}

	update() {
		const position = this.object.position;
		this.updateOffset.copy(position).sub(this.target);

		// rotate offset to "y-axis-is-up" space
		this.updateOffset.applyQuaternion(this.updateQuat);

		// angle from z-axis around y-axis
		this.spherical.setFromVector3(this.updateOffset);

		if (this.autoRotate && this.state === STATE.NONE) {
			this.rotateLeft(this.getAutoRotationAngle());
		}

		this.spherical.theta += this.sphericalDelta.theta;
		this.spherical.phi += this.sphericalDelta.phi;

		// restrict theta to be between desired limits
		this.spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.spherical.theta));

		// restrict phi to be between desired limits
		this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));

		this.spherical.makeSafe();

		this.spherical.radius *= this.scale;

		// restrict radius to be between desired limits
		this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));

		// move target to panned location
		this.target.add(this.panOffset);

		this.updateOffset.setFromSpherical(this.spherical);

		// rotate offset back to "camera-up-vector-is-up" space
		this.updateOffset.applyQuaternion(this.updateQuatInverse);

		position.copy(this.target).add(this.updateOffset);

		this.object.lookAt(this.target);

		if (this.enableDamping === true) {

			this.sphericalDelta.theta *= (1 - this.dampingFactor);
			this.sphericalDelta.phi *= (1 - this.dampingFactor);

		} else {

			this.sphericalDelta.set(0, 0, 0);

		}

		this.scale = 1;
		this.panOffset.set(0, 0, 0);

		// update condition is:
		// min(camera displacement, camera rotation in radians)^2 > EPS
		// using small-angle approximation cos(x/2) = 1 - x^2 / 8

		if (this.zoomChanged ||
			this.updateLastPosition.distanceToSquared(this.object.position) > EPS ||
			8 * (1 - this.updateLastQuaternion.dot(this.object.quaternion)) > EPS) {

			this.dispatchEvent(CHANGE_EVENT);
			this.updateLastPosition.copy(this.object.position);
			this.updateLastQuaternion.copy(this.object.quaternion);
			this.zoomChanged = false;
			return true;
		}
		return false;
	}

	panLeft(distance: number, objectMatrix) {
		this.panLeftV.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
		this.panLeftV.multiplyScalar(- distance);
		this.panOffset.add(this.panLeftV);
	}

	panUp(distance: number, objectMatrix) {
		this.panUpV.setFromMatrixColumn(objectMatrix, 1); // get Y column of objectMatrix
		this.panUpV.multiplyScalar(distance);
		this.panOffset.add(this.panUpV);
	}

	// deltaX and deltaY are in pixels; right and down are positive
	pan(deltaX: number, deltaY: number) {
		if (this.object instanceof PerspectiveCamera) {
			// perspective
			const position = this.object.position;
			this.panInternalOffset.copy(position).sub(this.target);
			let targetDistance = this.panInternalOffset.length();

			// half of the fov is center to top of screen
			targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0);

			// we actually don"t use screenWidth, since perspective camera is fixed to screen height
			this.panLeft(2 * deltaX * targetDistance / this.domElement.clientHeight, this.object.matrix);
			this.panUp(2 * deltaY * targetDistance / this.domElement.clientHeight, this.object.matrix);
		} else if (this.object instanceof OrthographicCamera) {
			// orthographic
			this.panLeft(deltaX * (this.object.right - this.object.left) / this.object.zoom / this.domElement.clientWidth, this.object.matrix);
			this.panUp(deltaY * (this.object.top - this.object.bottom) / this.object.zoom / this.domElement.clientHeight, this.object.matrix);
		} else {
			// camera neither orthographic nor perspective
			console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.");
			this.enablePan = false;
		}
	}

	dollyIn(dollyScale) {
		if (this.object instanceof PerspectiveCamera) {
			this.scale /= dollyScale;
		} else if (this.object instanceof OrthographicCamera) {
			this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale));
			this.object.updateProjectionMatrix();
			this.zoomChanged = true;
		} else {
			console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
			this.enableZoom = false;
		}
	}

	dollyOut(dollyScale) {
		if (this.object instanceof PerspectiveCamera) {
			this.scale *= dollyScale;
		} else if (this.object instanceof OrthographicCamera) {
			this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale));
			this.object.updateProjectionMatrix();
			this.zoomChanged = true;
		} else {
			console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
			this.enableZoom = false;
		}
	}

	getAutoRotationAngle() {
		return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
	}

	getZoomScale() {
		return Math.pow(0.95, this.zoomSpeed);
	}

	rotateLeft(angle: number) {
		this.sphericalDelta.theta -= angle;
	}

	rotateUp(angle: number) {
		this.sphericalDelta.phi -= angle;
	}

	getPolarAngle(): number {
		return this.spherical.phi;
	}

	getAzimuthalAngle(): number {
		return this.spherical.theta;
	}

	dispose(): void {
		this.domElement.removeEventListener("contextmenu", this.onContextMenu, false);
		this.domElement.removeEventListener("mousedown", this.onMouseDown, false);
		this.domElement.removeEventListener("wheel", this.onMouseWheel, false);

		this.domElement.removeEventListener("touchstart", this.onTouchStart, false);
		this.domElement.removeEventListener("touchend", this.onTouchEnd, false);
		this.domElement.removeEventListener("touchmove", this.onTouchMove, false);

		document.removeEventListener("mousemove", this.onMouseMove, false);
		document.removeEventListener("mouseup", this.onMouseUp, false);

		this.window.removeEventListener("keydown", this.onKeyDown, false);
		// this.dispatchEvent( { type: "dispose" } ); // should this be added here?
	}

	reset(): void {
		this.target.copy(this.target0);
		this.object.position.copy(this.position0);
		this.object.zoom = this.zoom0;

		this.object.updateProjectionMatrix();
		this.dispatchEvent(CHANGE_EVENT);

		this.update();

		this.state = STATE.NONE;
	}
}

export function createOrbitControls(skinViewer: SkinViewer) {
	const control = new OrbitControls(skinViewer.camera, skinViewer.renderer.domElement);

	// default configuration
	control.enablePan = false;
	control.target = new Vector3(0, -12, 0);
	control.minDistance = 10;
	control.maxDistance = 256;
	control.update();

	return control;
}
