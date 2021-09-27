import { SkinViewer } from "./viewer";

export class DebugCanvas {
	private wrapperElement: HTMLElement | null;
	private canvas: HTMLCanvasElement | null;
	private ctx: CanvasRenderingContext2D | null;
	private _skinViewer: SkinViewer;
	public enabled: boolean = false;

	constructor(skinViewer: SkinViewer) {
		this.canvas = null;
		this.ctx = null;
		this.wrapperElement = null;

		this._skinViewer = skinViewer;
	}

	createCanvas(): void {
		// create the canvas
		this.canvas = document.createElement("canvas");

		const width = 100;
		const height = 92;

		this.ctx = this.canvas.getContext("2d");

		// attempt dpi correction
		const ratio = Math.ceil(window.devicePixelRatio);
		this.canvas.width = width * ratio;
		this.canvas.height = height * ratio;
		this.canvas.style.width = `${width}px`;
		this.canvas.style.height = `${height}px`;

		// create a wrapper node
		const wrapper = document.createElement("div");
		wrapper.style.position = "absolute";
		wrapper.style.top = "0";
		wrapper.style.left = "0";
		wrapper.style.background = "rgba(0,0,0,0.5)";
		wrapper.appendChild(this.canvas);

		this.wrapperElement = wrapper;

		// add it to the dom and overlay it aboslute
		const parent = this._skinViewer.canvas.parentNode;
		if (parent) {
			parent.appendChild(wrapper);
		}
	}

	destroyCanvas(): void {
		// attempt to remove canvas
		this.wrapperElement?.remove();

		this.canvas = null;
		this.wrapperElement = null;
	}

	setState(state: boolean): void {
		// set the new state
		this.enabled = state;

		// call the create/destroy method based on prior
		this.enabled ? this.createCanvas() : this.destroyCanvas();

		// debug log
		console.info("[Debug canvas]", this.enabled ? "enabled" : "disabled");
	}

	render(): void {
		const { ctx, canvas, _skinViewer } = this;

		if (!ctx || !canvas) {
			return;
		}

		const { x, y, z } = _skinViewer.camera.position;
		const { x: rotX, y: rotY, z: rotZ } = _skinViewer.camera.rotation;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.font = "14px serif";
		ctx.fillStyle = "white";

		const items = [
			`x: ${x.toFixed(2)}`,
			`y: ${y.toFixed(2)}`,
			`z: ${z.toFixed(2)}`,
			`rotX: ${rotX.toFixed(2)}`,
			`rotY: ${rotY.toFixed(2)}`,
			`rotZ: ${rotZ.toFixed(2)}`,
		];

		const spacing = 15;
		const offsetX = 15;
		const offsetY = 6;
		items.forEach((s, index) => ctx.fillText(s, offsetY, offsetX + spacing * index));
	}
}
