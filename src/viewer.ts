import { inferModelType, isTextureSource, loadImage, loadSkinToCanvas, loadCapeToCanvas, animateCape, loadEarsToCanvas, ModelType, RemoteImage, TextureSource } from "@james090500/skinview-utils";
import { NearestFilter, PerspectiveCamera, Scene, Texture, Vector2, WebGLRenderer } from "three";
import { RootAnimation } from "./animation.js";
import { BackEquipment, PlayerObject } from "./model.js";

export interface LoadOptions {
	/**
	 * Whether to make the object visible after the texture is loaded. Default is true.
	 */
	makeVisible?: boolean;
}

export interface CapeLoadOptions extends LoadOptions {
	/**
	 * The equipment (cape or elytra) to show, defaults to "cape".
	 * If makeVisible is set to false, this option will have no effect.
	 */
	backEquipment?: BackEquipment;
}

export interface SkinViewerOptions {
	width?: number;
	height?: number;
	skin?: RemoteImage | TextureSource;
	model?: ModelType | "auto-detect";
	cape?: RemoteImage | TextureSource;
	ears?: RemoteImage | TextureSource;

	/**
	 * Whether the canvas contains an alpha buffer. Default is true.
	 * This option can be turned off if you use an opaque background.
	 */
	alpha?: boolean;

	/**
	 * Render target.
	 * A new canvas is created if this parameter is unspecified.
	 */
	canvas?: HTMLCanvasElement;

	/**
	 * Whether to preserve the buffers until manually cleared or overwritten. Default is false.
	 */
	preserveDrawingBuffer?: boolean;

	/**
	 * The initial value of `SkinViewer.renderPaused`. Default is false.
	 * If this option is true, rendering and animation loops will not start.
	 */
	renderPaused?: boolean;
}

export class SkinViewer {
	readonly canvas: HTMLCanvasElement;
	readonly scene: Scene;
	readonly camera: PerspectiveCamera;
	readonly renderer: WebGLRenderer;
	readonly playerObject: PlayerObject;
	readonly animations: RootAnimation = new RootAnimation();

	readonly skinCanvas: HTMLCanvasElement;
	readonly capeCanvas: HTMLCanvasElement;
	readonly earsCanvas: HTMLCanvasElement;
	private readonly skinTexture: Texture;
	private readonly capeTexture: Texture;
	private readonly earTexture: Texture;

	private capeImage: TextureSource | undefined;

	private _disposed: boolean = false;
	private _renderPaused: boolean = false;

	constructor(options: SkinViewerOptions = {}) {
		this.canvas = options.canvas === undefined ? document.createElement("canvas") : options.canvas;

		// texture
		this.skinCanvas = document.createElement("canvas");
		this.skinTexture = new Texture(this.skinCanvas);
		this.skinTexture.magFilter = NearestFilter;
		this.skinTexture.minFilter = NearestFilter;

		this.capeCanvas = document.createElement("canvas");
		this.capeTexture = new Texture(this.capeCanvas);
		this.capeTexture.magFilter = NearestFilter;
		this.capeTexture.minFilter = NearestFilter;

		this.earsCanvas = document.createElement("canvas");
		this.earTexture = new Texture(this.earsCanvas);
		this.earTexture.magFilter = NearestFilter;
		this.earTexture.minFilter = NearestFilter;

		// scene
		this.scene = new Scene();

		// Use smaller fov to avoid distortion
		this.camera = new PerspectiveCamera(40);
		this.camera.position.y = -8;
		this.camera.position.z = 64;

		try {
			this.renderer = new WebGLRenderer({
				canvas: this.canvas,
				alpha: options.alpha !== false, // default: true
				preserveDrawingBuffer: options.preserveDrawingBuffer === true // default: false
			});
			this.renderer.setPixelRatio(window.devicePixelRatio);
		} catch(error) {
			const errorDiv = document.createElement('div');
			errorDiv.classList.add(`${this.canvas.id}_error`);
			errorDiv.textContent = "Your browser doesn't support WebGL. You will encounter issues!";
			document.body.insertBefore(errorDiv, this.canvas.nextSibling)
			this.canvas.remove();
			throw "No WebGL Support";
		}

		this.playerObject = new PlayerObject(this.skinTexture, this.capeTexture, this.earTexture);
		this.playerObject.name = "player";
		this.playerObject.skin.visible = false;
		this.playerObject.cape.visible = false;
		this.playerObject.ears.visible = false;
		this.scene.add(this.playerObject);
``
		if (options.skin !== undefined) {
			this.loadSkin(options.skin, options.model);
		}
		if (options.cape !== undefined) {
			this.loadCape(options.cape);
		}
		if (options.ears !== undefined) {
			this.loadEars(options.ears);
		}
		if (options.width !== undefined) {
			this.width = options.width;
		}
		if (options.height !== undefined) {
			this.height = options.height;
		}

		if (options.renderPaused === true) {
			this._renderPaused = true;
		} else {
			window.requestAnimationFrame(() => this.draw());
		}
	}

	/**
	 * 	Loads the Skin
	 */
	loadSkin(empty: null): void;
	loadSkin<S extends TextureSource | RemoteImage>(
		source: S,
		model?: ModelType | "auto-detect",
		options?: LoadOptions
	): S extends TextureSource ? void : Promise<void>;
	loadSkin(
		source: TextureSource | RemoteImage | null,
		model: ModelType | "auto-detect" = "auto-detect",
		options: LoadOptions = {}
	): void | Promise<void> {
		if (source === null) {
			this.resetSkin();
		} else if (isTextureSource(source)) {
			loadSkinToCanvas(this.skinCanvas, source);
			const actualModel = model === "auto-detect" ? inferModelType(this.skinCanvas) : model;
			this.skinTexture.needsUpdate = true;
			this.playerObject.skin.modelType = actualModel;
			if (options.makeVisible !== false) {
				this.playerObject.skin.visible = true;
			}
		} else {
			return loadImage(source).then(image => this.loadSkin(image, model, options)).catch(e => {
				console.log(e);
			});
		}
	}

	/**
	 * Loads the cape
	 */
	loadCape(empty: null): void;
	loadCape<S extends TextureSource | RemoteImage>(
		source: S,
		options?: CapeLoadOptions
	): S extends TextureSource ? void : Promise<void>;
	loadCape(
		source: TextureSource | RemoteImage | null,
		options: CapeLoadOptions = {}
	): void | Promise<void> {
		if (source === null) {
			this.resetCape();
		} else if (isTextureSource(source)) {
			loadCapeToCanvas(this.capeCanvas, source);
			this.capeTexture.needsUpdate = true;
			if (options.makeVisible !== false) {
				this.playerObject.backEquipment = options.backEquipment === undefined ? "cape" : options.backEquipment;
			}
		} else {
			return loadImage(source).then(image => {
				this.capeImage = image
				this.loadCape(image, options)
			}).catch(e => {
				console.log(e);
			});
		}
	}

	/**
	 * Load Ears
	 */
	loadEars(empty: null): void;
	loadEars<S extends TextureSource | RemoteImage>(
		source: S,
		options?: LoadOptions
	): S extends TextureSource ? void : Promise<void>;
	loadEars(
		source: TextureSource | RemoteImage | null,
		options: LoadOptions = {}
	): void | Promise<void> {
		if (source === null) {
			this.resetEars();
		} else if (isTextureSource(source)) {
			loadEarsToCanvas(this.earsCanvas, source);
			this.earTexture.needsUpdate = true;
			this.playerObject.ears.visible = true;
		} else {
			return loadImage(source).then(image => this.loadEars(image, options)).catch(e => {
				console.log(e);
			});
		}
	}

	protected resetSkin(): void {
		this.playerObject.skin.visible = false;
	}

	protected resetCape(): void {
		this.playerObject.backEquipment = null;
	}

	protected resetEars(): void {
		this.playerObject.ears.visible = false;
	}

	private draw(): void {
		if (this.disposed || this._renderPaused) {
			return;
		}
		this.animations.runAnimationLoop(this.playerObject);
		this.render();

		if(this.capeImage != undefined) {
			this.capeTexture.needsUpdate = animateCape(this.capeCanvas, this.capeImage);
		}

		window.requestAnimationFrame(() => this.draw());
	}

	/**
	* Renders the scene to the canvas.
	* This method does not change the animation progress.
	*/
	render(): void {
		this.renderer.render(this.scene, this.camera);
	}

	setSize(width: number, height: number): void {
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		//False at the end to disable updateStyle to stop the canvas having inline styles added
		this.renderer.setSize(width, height, false);
	}

	dispose(): void {
		this._disposed = true;
		this.renderer.dispose();
		this.skinTexture.dispose();
		this.capeTexture.dispose();
		this.earTexture.dispose();
	}

	get disposed(): boolean {
		return this._disposed;
	}

	/**
	 * Whether rendering and animations are paused.
	 * Setting this property to true will stop both rendering and animation loops.
	 * Setting it back to false will resume them.
	 */
	get renderPaused(): boolean {
		return this._renderPaused;
	}

	set renderPaused(value: boolean) {
		const toResume = !this.disposed && !value && this._renderPaused;
		this._renderPaused = value;
		if (toResume) {
			window.requestAnimationFrame(() => this.draw());
		}
	}

	get width(): number {
		return this.renderer.getSize(new Vector2()).width;
	}

	set width(newWidth: number) {
		this.setSize(newWidth, this.height);
	}

	get height(): number {
		return this.renderer.getSize(new Vector2()).height;
	}

	set height(newHeight: number) {
		this.setSize(this.width, newHeight);
	}
}
