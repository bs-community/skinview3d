import { applyMixins, CapeContainer, ModelType, SkinContainer, RemoteImage, TextureSource, TextureCanvas, loadImage, isTextureSource } from "skinview-utils";
import { NearestFilter, PerspectiveCamera, Scene, Texture, Vector2, WebGLRenderer } from "three";
import { RootAnimation } from "./animation.js";
import { PlayerObject } from "./model.js";

export type LoadOptions = {
	/**
	 * Whether to make the object visible after the texture is loaded. Default is true.
	 */
	makeVisible?: boolean;
}

export type SkinViewerOptions = {
	width?: number;
	height?: number;
	skin?: RemoteImage | TextureSource;
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

function toMakeVisible(options?: LoadOptions): boolean {
	if (options && options.makeVisible === false) {
		return false;
	}
	return true;
}

class SkinViewer {
	readonly canvas: HTMLCanvasElement;
	readonly scene: Scene;
	readonly camera: PerspectiveCamera;
	readonly renderer: WebGLRenderer;
	readonly playerObject: PlayerObject;
	readonly animations: RootAnimation = new RootAnimation();

	readonly skinCanvas: HTMLCanvasElement;
	readonly capeCanvas: HTMLCanvasElement;
	readonly earCanvas: HTMLCanvasElement;
	private readonly skinTexture: Texture;
	private readonly capeTexture: Texture;
	private readonly earTexture: Texture;

	// Animated Capes (MinecraftCapes)
	private customCapeImage: TextureSource
	private lastFrame: number;
	private maxFrames: number;
	private lastFrameTime: number;
	private capeInterval: number;

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

		this.earCanvas = document.createElement("canvas");
		this.earTexture = new Texture(this.earCanvas);
		this.earTexture.magFilter = NearestFilter;
		this.earTexture.minFilter = NearestFilter;

		// Animated Capes (MinecraftCapes)
		this.customCapeImage = new Image()
		this.lastFrame = 0,
		this.maxFrames = 1,
		this.lastFrameTime = 0,
		this.capeInterval = 100,

		// scene
		this.scene = new Scene();

		// Use smaller fov to avoid distortion
		this.camera = new PerspectiveCamera(42);
		this.camera.zoom
		this.camera.position.y = -12;
		this.camera.position.z = 60;

		this.renderer = new WebGLRenderer({
			canvas: this.canvas,
			alpha: options.alpha !== false, // default: true
			preserveDrawingBuffer: options.preserveDrawingBuffer === true // default: false

		});
		this.renderer.setPixelRatio(window.devicePixelRatio);

		this.playerObject = new PlayerObject(this.skinTexture, this.capeTexture, this.earTexture);
		this.playerObject.name = "player";
		this.playerObject.skin.visible = false;
		this.playerObject.cape.visible = false;
		this.playerObject.ears.visible = false;
		this.scene.add(this.playerObject);

		if (options.skin !== undefined) {
			this.loadSkin(options.skin);
		}
		if (options.cape !== undefined) {
			this.loadCustomCape(options.cape);
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

	protected skinLoaded(model: ModelType, options?: LoadOptions): void {
		this.skinTexture.needsUpdate = true;
		this.playerObject.skin.modelType = model;
		if (toMakeVisible(options)) {
			this.playerObject.skin.visible = true;
		}
	}

	protected capeLoaded(options?: LoadOptions): void {
		this.capeTexture.needsUpdate = true;
		if (toMakeVisible(options)) {
			this.playerObject.cape.visible = true;
		}
	}

	protected earsLoaded(options?: LoadOptions): void {
		this.earTexture.needsUpdate = true;
		if (toMakeVisible(options)) {
			this.playerObject.ears.visible = true;
		}
	}

	protected resetSkin(): void {
		this.playerObject.skin.visible = false;
	}

	protected resetCape(): void {
		this.playerObject.cape.visible = false;
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
		this.animatedCape();
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
		this.renderer.setSize(width, height);
	}

	dispose(): void {
		this._disposed = true;
		this.renderer.dispose();
		this.skinTexture.dispose();
		this.capeTexture.dispose();
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

	/**
	 * Code for MinecraftCapes
	 */
	public loadCustomCape(source: TextureSource | RemoteImage | null): void | Promise<void> {
		if(source === null) {
			this.resetCape();
		} else if(isTextureSource(source)) {
			this.customCapeImage = source;
			this.loadCapeToCanvas(this.capeCanvas, source, 0);
		} else {
			loadImage(source).then(image => this.loadCustomCape(image)).catch(error => {});
		}
	}

	protected loadCapeToCanvas(canvas: TextureCanvas, image: TextureSource, offset: number): void {
		canvas.width = image.width,
		canvas.height = image.width / 2;
		var frame = canvas.getContext("2d");
		if(frame != null) {
			frame.clearRect(0, 0, canvas.width, canvas.height),
			frame.drawImage(image, 0, offset, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)
			this.capeLoaded();
		}
    }

	protected animatedCape() {
		if (this.customCapeImage.height !== this.customCapeImage.width / 2) {
			let currentTime = Date.now();
			if (currentTime > this.lastFrameTime + this.capeInterval) {
				this.maxFrames = this.customCapeImage.height / (this.customCapeImage.width / 2);
				let currentFrame = this.lastFrame + 1 > this.maxFrames - 1 ? 0 : this.lastFrame + 1;
				this.lastFrame = currentFrame,
				this.lastFrameTime = currentTime;
				let offset = currentFrame * (this.customCapeImage.width / 2);
				this.loadCapeToCanvas(this.capeCanvas, this.customCapeImage, offset),
				this.capeTexture.needsUpdate = true
				this.playerObject.cape.visible = !this.playerObject.elytra.visible;
			}
		}
	}

	public loadEars(source: TextureSource | RemoteImage | null): void | Promise<void> {
		if(source === null) {
			this.resetEars();
		} else if(isTextureSource(source)) {
			this.loadEarsToCanvas(this.earCanvas, source);
			this.earsLoaded();
		} else {
			loadImage(source).then(image => this.loadEars(image)).catch(error => {});
		}
	}

	protected loadEarsToCanvas(canvas: TextureCanvas, image: TextureSource): void {
		canvas.width = 14;
		canvas.height = 7;

		const context = canvas.getContext("2d")!;
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(image, 0, 0, image.width, image.height);
	}
}

interface SkinViewer extends SkinContainer<LoadOptions>, CapeContainer<LoadOptions> { }
applyMixins(SkinViewer, [SkinContainer, CapeContainer]);
export { SkinViewer };