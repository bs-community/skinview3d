import { inferModelType, isTextureSource, loadCapeToCanvas, loadEarsToCanvas, loadEarsToCanvasFromSkin, loadImage, loadSkinToCanvas, ModelType, RemoteImage, TextureSource } from "skinview-utils";
import { Color, ColorRepresentation, PointLight, EquirectangularReflectionMapping, Group, NearestFilter, PerspectiveCamera, Scene, Texture, Vector2, WebGLRenderer, AmbientLight, Mapping, CanvasTexture, WebGLRenderTarget, FloatType, DepthTexture } from "three";
import { EffectComposer, FullScreenQuad } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { RootAnimation } from "./animation.js";
import { BackEquipment, PlayerObject } from "./model.js";

export interface LoadOptions {
	/**
	 * Whether to make the object visible after the texture is loaded. Default is true.
	 */
	makeVisible?: boolean;
}

export interface SkinLoadOptions extends LoadOptions {
	/**
	 * The model type of skin. Default is "auto-detect".
	 */
	model?: ModelType | "auto-detect";

	/**
	 * true: Loads the ears drawn on the skin texture, and show it.
	 * "load-only": Loads the ears drawn on the skin texture, but do not make it visible.
	 * false: Do not load ears from the skin texture.
	 * Default is false.
	 */
	ears?: boolean | "load-only";
}

export interface CapeLoadOptions extends LoadOptions {
	/**
	 * The equipment (cape or elytra) to show, defaults to "cape".
	 * If makeVisible is set to false, this option will have no effect.
	 */
	backEquipment?: BackEquipment;
}

export interface EarsLoadOptions extends LoadOptions {
	/**
	 * "standalone": The texture is a 14x7 image that only contains the ears;
	 * "skin": The texture is a skin that contains ears, and we only show its ear part.
	 * Default is "standalone".
	 */
	textureType?: "standalone" | "skin";
}

export interface SkinViewerOptions {
	width?: number;
	height?: number;
	skin?: RemoteImage | TextureSource;
	model?: ModelType | "auto-detect";
	cape?: RemoteImage | TextureSource;

	/**
	 * If you want to show the ears drawn on the current skin, set this to "current-skin".
	 * To show ears that come from a separate texture, you have to specify 'textureType' ("standalone" or "skin") and 'source'.
	 * "standalone" means the provided texture is a 14x7 image that only contains the ears.
	 * "skin" means the provided texture is a skin that contains ears, and we only show its ear part.
	 */
	ears?: "current-skin" | {
		textureType: "standalone" | "skin",
		source: RemoteImage | TextureSource
	}

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

	/**
	 * The background of the scene. Default is transparent.
	 */
	background?: ColorRepresentation | Texture;

	/**
	 * The panorama background to use. This option overrides 'background' option.
	 */
	panorama?: RemoteImage | TextureSource;

	/**
	 * Camera vertical field of view, in degrees. Default is 50.
	 * The distance between the object and the camera is automatically computed.
	 */
	fov?: number;

	/**
	 * Zoom ratio of the player. Default is 0.9.
	 * This value affects the distance between the object and the camera.
	 * When set to 1.0, the top edge of the player's head coincides with the edge of the view.
	 */
	zoom?: number;
}

export class SkinViewer {
	readonly canvas: HTMLCanvasElement;
	readonly scene: Scene;
	readonly camera: PerspectiveCamera;
	readonly renderer: WebGLRenderer;
	readonly playerObject: PlayerObject;
	readonly playerWrapper: Group;
	readonly animations: RootAnimation = new RootAnimation();
	readonly globalLight: AmbientLight = new AmbientLight(0xffffff, 0.4);
	readonly cameraLight: PointLight = new PointLight(0xffffff, 0.6);

	readonly composer: EffectComposer;
	readonly renderPass: RenderPass;
	readonly fxaaPass: ShaderPass;

	readonly skinCanvas: HTMLCanvasElement;
	readonly capeCanvas: HTMLCanvasElement;
	readonly earsCanvas: HTMLCanvasElement;
	private skinTexture: Texture | null = null;
	private capeTexture: Texture | null = null;
	private earsTexture: Texture | null = null;
	private backgroundTexture: Texture | null = null;

	private _disposed: boolean = false;
	private _renderPaused: boolean = false;
	private _zoom: number;

	private animationID: number | null;
	private onContextLost: (event: Event) => void;
	private onContextRestored: () => void;

	constructor(options: SkinViewerOptions = {}) {
		this.canvas = options.canvas === undefined ? document.createElement("canvas") : options.canvas;

		this.skinCanvas = document.createElement("canvas");
		this.capeCanvas = document.createElement("canvas");
		this.earsCanvas = document.createElement("canvas");

		this.scene = new Scene();
		this.camera = new PerspectiveCamera();
		this.camera.add(this.cameraLight);
		this.scene.add(this.camera);
		this.scene.add(this.globalLight);

		this.renderer = new WebGLRenderer({
			canvas: this.canvas,
			preserveDrawingBuffer: options.preserveDrawingBuffer === true // default: false
		});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setClearColor(0, 0);

		let renderTarget;
		if (this.renderer.capabilities.isWebGL2) {
			// Use float precision depth if possible
			// see https://github.com/bs-community/skinview3d/issues/111
			renderTarget = new WebGLRenderTarget(0, 0, {
				depthTexture: new DepthTexture(0, 0, FloatType)
			});
		}
		this.composer = new EffectComposer(this.renderer, renderTarget);
		this.renderPass = new RenderPass(this.scene, this.camera);
		this.fxaaPass = new ShaderPass(FXAAShader);
		this.composer.addPass(this.renderPass);
		this.composer.addPass(this.fxaaPass);

		this.playerObject = new PlayerObject();
		this.playerObject.name = "player";
		this.playerObject.skin.visible = false;
		this.playerObject.cape.visible = false;
		this.playerWrapper = new Group();
		this.playerWrapper.add(this.playerObject);
		this.scene.add(this.playerWrapper);

		if (options.skin !== undefined) {
			this.loadSkin(options.skin, {
				model: options.model,
				ears: options.ears === "current-skin"
			});
		}
		if (options.cape !== undefined) {
			this.loadCape(options.cape);
		}
		if (options.ears !== undefined && options.ears !== "current-skin") {
			this.loadEars(options.ears.source, {
				textureType: options.ears.textureType
			});
		}
		if (options.width !== undefined) {
			this.width = options.width;
		}
		if (options.height !== undefined) {
			this.height = options.height;
		}
		if (options.background !== undefined) {
			this.background = options.background;
		}
		if (options.panorama !== undefined) {
			this.loadPanorama(options.panorama);
		}
		this.camera.position.z = 1;
		this._zoom = options.zoom === undefined ? 0.9 : options.zoom;
		this.fov = options.fov === undefined ? 50 : options.fov;

		if (options.renderPaused === true) {
			this._renderPaused = true;
			this.animationID = null;
		} else {
			this.animationID = window.requestAnimationFrame(() => this.draw());
		}

		this.onContextLost = (event: Event) => {
			event.preventDefault();
			if (this.animationID !== null) {
				window.cancelAnimationFrame(this.animationID);
				this.animationID = null;
			}
		};

		this.onContextRestored = () => {
			this.renderer.setClearColor(0, 0); // Clear color might be lost
			if (!this._renderPaused && !this._disposed && this.animationID === null) {
				this.animationID = window.requestAnimationFrame(() => this.draw());
			}
		};

		this.canvas.addEventListener("webglcontextlost", this.onContextLost, false);
		this.canvas.addEventListener("webglcontextrestored", this.onContextRestored, false);

		this.updateComposerSize();
	}

	private updateComposerSize(): void {
		this.composer.setSize(this.width, this.height);
		const pixelRatio = this.renderer.getPixelRatio();
		this.composer.setPixelRatio(pixelRatio);
		this.fxaaPass.material.uniforms["resolution"].value.x = 1 / (this.width * pixelRatio);
		this.fxaaPass.material.uniforms["resolution"].value.y = 1 / (this.height * pixelRatio);
	}

	private recreateSkinTexture(): void {
		if (this.skinTexture !== null) {
			this.skinTexture.dispose();
		}
		this.skinTexture = new CanvasTexture(this.skinCanvas);
		this.skinTexture.magFilter = NearestFilter;
		this.skinTexture.minFilter = NearestFilter;
		this.playerObject.skin.map = this.skinTexture;
	}

	private recreateCapeTexture(): void {
		if (this.capeTexture !== null) {
			this.capeTexture.dispose();
		}
		this.capeTexture = new CanvasTexture(this.capeCanvas);
		this.capeTexture.magFilter = NearestFilter;
		this.capeTexture.minFilter = NearestFilter;
		this.playerObject.cape.map = this.capeTexture;
		this.playerObject.elytra.map = this.capeTexture;
	}

	private recreateEarsTexture(): void {
		if (this.earsTexture !== null) {
			this.earsTexture.dispose();
		}
		this.earsTexture = new CanvasTexture(this.earsCanvas);
		this.earsTexture.magFilter = NearestFilter;
		this.earsTexture.minFilter = NearestFilter;
		this.playerObject.cape.map = this.earsTexture;
	}

	loadSkin(empty: null): void;
	loadSkin<S extends TextureSource | RemoteImage>(
		source: S,
		options?: SkinLoadOptions
	): S extends TextureSource ? void : Promise<void>;

	loadSkin(
		source: TextureSource | RemoteImage | null,
		options: SkinLoadOptions = {}
	): void | Promise<void> {
		if (source === null) {
			this.resetSkin();

		} else if (isTextureSource(source)) {
			loadSkinToCanvas(this.skinCanvas, source);
			this.recreateSkinTexture();

			if (options.model === undefined || options.model === "auto-detect") {
				this.playerObject.skin.modelType = inferModelType(this.skinCanvas);
			} else {
				this.playerObject.skin.modelType = options.model;
			}

			if (options.makeVisible !== false) {
				this.playerObject.skin.visible = true;
			}

			if (options.ears === true || options.ears == "load-only") {
				loadEarsToCanvasFromSkin(this.earsCanvas, source);
				this.recreateEarsTexture();
				if (options.ears === true) {
					this.playerObject.ears.visible = true;
				}
			}

		} else {
			return loadImage(source).then(image => this.loadSkin(image, options));
		}
	}

	resetSkin(): void {
		this.playerObject.skin.visible = false;
		this.playerObject.skin.map = null;
		if (this.skinTexture !== null) {
			this.skinTexture.dispose();
			this.skinTexture = null;
		}
	}

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
			this.recreateCapeTexture();

			if (options.makeVisible !== false) {
				this.playerObject.backEquipment = options.backEquipment === undefined ? "cape" : options.backEquipment;
			}

		} else {
			return loadImage(source).then(image => this.loadCape(image, options));
		}
	}

	resetCape(): void {
		this.playerObject.backEquipment = null;
		this.playerObject.cape.map = null;
		this.playerObject.elytra.map = null;
		if (this.capeTexture !== null) {
			this.capeTexture.dispose();
			this.capeTexture = null;
		}
	}

	loadEars(empty: null): void;
	loadEars<S extends TextureSource | RemoteImage>(
		source: S,
		options?: EarsLoadOptions
	): S extends TextureSource ? void : Promise<void>;

	loadEars(
		source: TextureSource | RemoteImage | null,
		options: EarsLoadOptions = {}
	): void | Promise<void> {
		if (source === null) {
			this.resetEars();

		} else if (isTextureSource(source)) {
			if (options.textureType === "skin") {
				loadEarsToCanvasFromSkin(this.earsCanvas, source);
			} else {
				loadEarsToCanvas(this.earsCanvas, source);
			}
			this.recreateEarsTexture();

			if (options.makeVisible !== false) {
				this.playerObject.ears.visible = true;
			}

		} else {
			return loadImage(source).then(image => this.loadEars(image, options));
		}
	}

	resetEars(): void {
		this.playerObject.ears.visible = false;
		this.playerObject.ears.map = null;
		if (this.earsTexture !== null) {
			this.earsTexture.dispose();
			this.earsTexture = null;
		}
	}

	loadPanorama<S extends TextureSource | RemoteImage>(
		source: S
	): S extends TextureSource ? void : Promise<void> {
		return this.loadBackground(source, EquirectangularReflectionMapping);
	}

	loadBackground<S extends TextureSource | RemoteImage>(
		source: S,
		mapping?: Mapping
	): S extends TextureSource ? void : Promise<void>;

	loadBackground<S extends TextureSource | RemoteImage>(
		source: S,
		mapping?: Mapping
	): void | Promise<void> {
		if (isTextureSource(source)) {
			if (this.backgroundTexture !== null) {
				this.backgroundTexture.dispose();
			}
			this.backgroundTexture = new Texture();
			this.backgroundTexture.image = source;
			if (mapping !== undefined) {
				this.backgroundTexture.mapping = mapping;
			}
			this.backgroundTexture.needsUpdate = true;
			this.scene.background = this.backgroundTexture;
		} else {
			return loadImage(source).then(image => this.loadBackground(image, mapping));
		}
	}

	private draw(): void {
		this.animations.runAnimationLoop(this.playerObject);
		this.render();
		this.animationID = window.requestAnimationFrame(() => this.draw());
	}

	/**
	* Renders the scene to the canvas.
	* This method does not change the animation progress.
	*/
	render(): void {
		this.composer.render();
	}

	setSize(width: number, height: number): void {
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
		this.updateComposerSize();
	}

	dispose(): void {
		this._disposed = true;

		this.canvas.removeEventListener("webglcontextlost", this.onContextLost, false);
		this.canvas.removeEventListener("webglcontextrestored", this.onContextRestored, false);

		if (this.animationID !== null) {
			window.cancelAnimationFrame(this.animationID);
			this.animationID = null;
		}

		this.renderer.dispose();
		this.resetSkin();
		this.resetCape();
		this.resetEars();
		this.background = null;
		(this.fxaaPass.fsQuad as FullScreenQuad).dispose();
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
		this._renderPaused = value;

		if (this._renderPaused && this.animationID !== null) {
			window.cancelAnimationFrame(this.animationID);
			this.animationID = null;
		} else if (!this._renderPaused && !this._disposed && !this.renderer.getContext().isContextLost() && this.animationID == null) {
			this.animationID = window.requestAnimationFrame(() => this.draw());
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

	get background(): null | Color | Texture {
		return this.scene.background;
	}

	set background(value: null | ColorRepresentation | Texture) {
		if (value === null || value instanceof Color || value instanceof Texture) {
			this.scene.background = value;
		} else {
			this.scene.background = new Color(value);
		}
		if (this.backgroundTexture !== null && value !== this.backgroundTexture) {
			this.backgroundTexture.dispose();
			this.backgroundTexture = null;
		}
	}

	adjustCameraDistance(): void {
		let distance = 4.5 + 16.5 / Math.tan(this.fov / 180 * Math.PI / 2) / this.zoom;

		// limit distance between 10 ~ 256 (default min / max distance of OrbitControls)
		if (distance < 10) {
			distance = 10;
		} else if (distance > 256) {
			distance = 256;
		}

		this.camera.position.multiplyScalar(distance / this.camera.position.length());
		this.camera.updateProjectionMatrix();
	}

	get fov(): number {
		return this.camera.fov;
	}

	set fov(value: number) {
		this.camera.fov = value;
		this.adjustCameraDistance();
	}

	get zoom(): number {
		return this._zoom;
	}

	set zoom(value: number) {
		this._zoom = value;
		this.adjustCameraDistance();
	}
}
