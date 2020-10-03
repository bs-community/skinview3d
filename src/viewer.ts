import { applyMixins, CapeContainer, ModelType, SkinContainer, RemoteImage, TextureSource } from "skinview-utils";
import { NearestFilter, PerspectiveCamera, Scene, Texture, Vector2, WebGLRenderer } from "three";
import { RootAnimation } from "./animation.js";
import { PlayerObject } from "./model.js";

export interface LoadOptions {
	/**
	 * Whether to make the object visible after the texture is loaded. Default is true.
	 */
	makeVisible?: boolean;
}

export interface SkinViewerOptions {
	width?: number;
	height?: number;
	skin?: RemoteImage | TextureSource;
	cape?: RemoteImage | TextureSource;

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
	private readonly skinTexture: Texture;
	private readonly capeTexture: Texture;

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

		this.scene = new Scene();

		// Use smaller fov to avoid distortion
		this.camera = new PerspectiveCamera(40);
		this.camera.position.y = -8;
		this.camera.position.z = 60;

		this.renderer = new WebGLRenderer({
			canvas: this.canvas,
			alpha: options.alpha !== false, // default: true
			preserveDrawingBuffer: options.preserveDrawingBuffer === true // default: false

		});
		this.renderer.setPixelRatio(window.devicePixelRatio);

		this.playerObject = new PlayerObject(this.skinTexture, this.capeTexture);
		this.playerObject.name = "player";
		this.playerObject.skin.visible = false;
		this.playerObject.cape.visible = false;
		this.scene.add(this.playerObject);

		if (options.skin !== undefined) {
			this.loadSkin(options.skin);
		}
		if (options.cape !== undefined) {
			this.loadCape(options.cape);
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

	protected resetSkin(): void {
		this.playerObject.skin.visible = false;
	}

	protected resetCape(): void {
		this.playerObject.cape.visible = false;
	}

	private draw(): void {
		if (this.disposed || this._renderPaused) {
			return;
		}
		this.animations.runAnimationLoop(this.playerObject);
		this.render();
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
}
interface SkinViewer extends SkinContainer<LoadOptions>, CapeContainer<LoadOptions> { }
applyMixins(SkinViewer, [SkinContainer, CapeContainer]);
export { SkinViewer };
