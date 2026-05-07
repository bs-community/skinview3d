import {
	inferModelType,
	isTextureSource,
	loadCapeToCanvas,
	loadEarsToCanvas,
	loadEarsToCanvasFromSkin,
	loadImage,
	loadSkinToCanvas,
	type ModelType,
	type RemoteImage,
	type TextureSource,
} from "skinview-utils";
import {
	Color,
	type ColorRepresentation,
	PointLight,
	EquirectangularReflectionMapping,
	Group,
	NearestFilter,
	PerspectiveCamera,
	Scene,
	Texture,
	Vector2,
	Vector3,
	WebGLRenderer,
	AmbientLight,
	type Mapping,
	CanvasTexture,
	WebGLRenderTarget,
	FloatType,
	DepthTexture,
	Clock,
	Object3D,
	ColorManagement,
	MeshStandardMaterial,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { PlayerAnimation } from "./animation.js";
import { type BackEquipment, PlayerObject } from "./model.js";
import { NameTagObject } from "./nametag.js";

export interface LoadOptions {
	/**
	 * Whether to make the object visible after the texture is loaded.
	 *
	 * @defaultValue `true`
	 */
	makeVisible?: boolean;
}

export interface SkinLoadOptions extends LoadOptions {
	/**
	 * The model of the player (`"default"` for normal arms, and `"slim"` for slim arms).
	 *
	 * When set to `"auto-detect"`, the model will be inferred from the skin texture.
	 *
	 * @defaultValue `"auto-detect"`
	 */
	model?: ModelType | "auto-detect";

	/**
	 * Whether to display the ears drawn on the skin texture.
	 *
	 * - `true` - Display the ears drawn on the skin texture.
	 * - `"load-only"` - Loads the ear texture, but do not make them visible.
	 *   You can make them visible later by setting `PlayerObject.ears.visible` to `true`.
	 * - `false` - Do not load or show the ears.
	 *
	 * @defaultValue `false`
	 */
	ears?: boolean | "load-only";

	/**
	 * The armor textures to load along with the skin.
	 *
	 * This option behaves exactly the same as the `armors` option in {@link SkinViewerOptions}.
	 * You can specify an object containing textures for specific armor pieces.
	 * The object may include any of the following optional properties:
	 * - `helmet`, `chestplate`, `leggings`, `boots`: direct textures for each piece.
	 * - `main`: a texture that will be used for helmet, chestplate, and boots if their specific textures are not provided.
	 * - `legs`: a texture that will be used for leggings if not provided.
	 *
	 * If the option is omitted, all armors will be removed.
	 */
	armors?: ArmorTexture;
}

export interface CapeLoadOptions extends LoadOptions {
	/**
	 * The equipment (`"cape"` or `"elytra"`) to show when the cape texture is loaded.
	 *
	 * If `makeVisible` is set to false, this option will have no effect.
	 *
	 * @defaultValue `"cape"`
	 */
	backEquipment?: BackEquipment;
}

export interface EarsLoadOptions extends LoadOptions {
	/**
	 * The type of the provided ear texture.
	 *
	 * - `"standalone"` means the provided texture is a 14x7 image that only contains the ears.
	 * - `"skin"` means the provided texture is a skin texture with ears, and we will use its ear part.
	 *
	 * @defaultValue `"standalone"`
	 */
	textureType?: "standalone" | "skin";
}
type ArmorTexture = Partial<{
	helmet: TextureSource | RemoteImage | null;
	chestplate: TextureSource | RemoteImage | null;
	leggings: TextureSource | RemoteImage | null;
	boots: TextureSource | RemoteImage | null;
	main: TextureSource | RemoteImage | null;
	legs: TextureSource | RemoteImage | null;
}>;
type NormalizedArmor = {
	helmet: TextureSource | RemoteImage | null;
	chestplate: TextureSource | RemoteImage | null;
	leggings: TextureSource | RemoteImage | null;
	boots: TextureSource | RemoteImage | null;
};
export interface SkinViewerOptions {
	/**
	 * The canvas where the renderer draws its output.
	 *
	 * @defaultValue If unspecified, a new canvas element will be created.
	 */
	canvas?: HTMLCanvasElement;

	/**
	 * The CSS width of the canvas.
	 */
	width?: number;

	/**
	 * The CSS height of the canvas.
	 */
	height?: number;

	/**
	 * The pixel ratio of the canvas.
	 *
	 * When set to `"match-device"`, the current device pixel ratio will be used,
	 * and it will be automatically updated when the device pixel ratio changes.
	 *
	 * @defaultValue `"match-device"`
	 */
	pixelRatio?: number | "match-device";

	/**
	 * The skin texture of the player.
	 *
	 * @defaultValue If unspecified, the skin will be invisible.
	 */
	skin?: RemoteImage | TextureSource;

	/**
	 * The model of the player (`"default"` for normal arms, and `"slim"` for slim arms).
	 *
	 * When set to `"auto-detect"`, the model will be inferred from the skin texture.
	 *
	 * If the `skin` option is not specified, this option will have no effect.
	 *
	 * @defaultValue `"auto-detect"`
	 */
	model?: ModelType | "auto-detect";

	/**
	 * The cape texture of the player.
	 *
	 * @defaultValue If unspecified, the cape will be invisible.
	 */
	cape?: RemoteImage | TextureSource;

	/**
	 * The ear texture of the player.
	 *
	 * When set to `"current-skin"`, the ears drawn on the current skin texture (as is specified in the `skin` option) will be shown.
	 *
	 * To use an individual ear texture, you have to specify the `textureType` and the `source` option.
	 * `source` is the texture to use, and `textureType` can be either `"standalone"` or `"skin"`:
	 *   - `"standalone"` means the provided texture is a 14x7 image that only contains the ears.
	 *   - `"skin"` means the provided texture is a skin texture with ears, and we will show its ear part.
	 *
	 * @defaultValue If unspecified, the ears will be invisible.
	 */
	ears?:
		| "current-skin"
		| {
				textureType: "standalone" | "skin";
				source: RemoteImage | TextureSource;
		  };
	/**
	 * The armor textures of the player.
	 *
	 * You can specify an object containing textures for different armor pieces.
	 * The object may include any of the following optional properties:
	 * - `helmet`, `chestplate`, `leggings`, `boots`: textures for individual pieces.
	 * - `main`: a texture that will be applied to helmet, chestplate, and boots when their specific properties are absent.
	 * - `legs`: a texture that will be applied to leggings when `leggings` is absent.
	 *
	 * Each texture can be a `RemoteImage` (URL string), a `TextureSource` (HTML image element), or `null` to hide that piece.
	 *
	 * If a property is omitted, it defaults to `null` (no texture for that piece), but may be overridden by `main` or `legs` as described above.
	 *
	 * If the option is omitted, set to `null`, or an empty object, all armors will be removed.
	 *
	 * @defaultValue `undefined` (no armor)
	 */
	armors?: ArmorTexture;

	/**
	 * Whether to preserve the buffers until manually cleared or overwritten.
	 *
	 * @defaultValue `false`
	 */
	preserveDrawingBuffer?: boolean;

	/**
	 * Whether to pause the rendering and animation loop.
	 *
	 * @defaultValue `false`
	 */
	renderPaused?: boolean;

	/**
	 * The background of the scene.
	 *
	 * @defaultValue transparent
	 */
	background?: ColorRepresentation | Texture;

	/**
	 * The panorama background to use.
	 *
	 * This option overrides the `background` option.
	 */
	panorama?: RemoteImage | TextureSource;

	/**
	 * Camera vertical field of view, in degrees.
	 *
	 * The distance between the player and the camera will be automatically computed from `fov` and `zoom`.
	 *
	 * @defaultValue `50`
	 *
	 * @see {@link SkinViewer.adjustCameraDistance}
	 */
	fov?: number;

	/**
	 * Zoom ratio of the player.
	 *
	 * This value affects the distance between the object and the camera.
	 * When set to `1.0`, the top edge of the player's head coincides with the edge of the canvas.
	 *
	 * The distance between the player and the camera will be automatically computed from `fov` and `zoom`.
	 *
	 * @defaultValue `0.9`
	 *
	 * @see {@link SkinViewer.adjustCameraDistance}
	 */
	zoom?: number;

	/**
	 * Whether to enable mouse control function.
	 *
	 * This function is implemented using {@link OrbitControls}.
	 * By default, zooming and rotating are enabled, and panning is disabled.
	 *
	 * @defaultValue `true`
	 */
	enableControls?: boolean;

	/**
	 * The animation to play on the player.
	 *
	 * @defaultValue If unspecified, no animation will be played.
	 */
	animation?: PlayerAnimation;

	/**
	 * The name tag to display above the player.
	 *
	 * @defaultValue If unspecified, no name tag will be displayed.
	 * @see {@link SkinViewer.nameTag}
	 */
	nameTag?: NameTagObject | string;
}

/**
 * The SkinViewer renders the player on a canvas.
 */
export class SkinViewer {
	/**
	 * The canvas where the renderer draws its output.
	 */
	readonly canvas: HTMLCanvasElement;

	readonly scene: Scene;

	readonly camera: PerspectiveCamera;

	readonly renderer: WebGLRenderer;

	/**
	 * The OrbitControls component which is used to implement the mouse control function.
	 *
	 * @see {@link https://threejs.org/docs/#examples/en/controls/OrbitControls | OrbitControls - three.js docs}
	 */
	readonly controls: OrbitControls;

	/**
	 * The player object.
	 */
	readonly playerObject: PlayerObject;

	/**
	 * A group that wraps the player object.
	 * It is used to center the player in the world.
	 */
	readonly playerWrapper: Group;

	readonly globalLight: AmbientLight = new AmbientLight(0xffffff, 3);
	readonly cameraLight: PointLight = new PointLight(0xffffff, 0.6);

	readonly composer: EffectComposer;
	readonly renderPass: RenderPass;
	readonly fxaaPass: ShaderPass;

	readonly skinCanvas: HTMLCanvasElement;

	readonly armorHelmetCanvas: HTMLCanvasElement;
	readonly armorChestplateCanvas: HTMLCanvasElement;
	readonly armorLeggingsCanvas: HTMLCanvasElement;
	readonly armorBootsCanvas: HTMLCanvasElement;
	private contexts: (CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D)[] = [];

	readonly capeCanvas: HTMLCanvasElement;
	readonly earsCanvas: HTMLCanvasElement;
	private skinTexture: Texture | null = null;
	private armorHelmetTexture: Texture | null = null;
	private armorChestplateTexture: Texture | null = null;
	private armorLeggingsTexture: Texture | null = null;
	private armorBootsTexture: Texture | null = null;
	private capeTexture: Texture | null = null;
	private earsTexture: Texture | null = null;
	private backgroundTexture: Texture | null = null;

	private _disposed: boolean = false;
	private _renderPaused: boolean = false;
	private _zoom: number;
	private isUserRotating: boolean = false;

	/**
	 * Whether to rotate the player along the y axis.
	 *
	 * @defaultValue `false`
	 */
	autoRotate: boolean = false;

	/**
	 * The angular velocity of the player, in rad/s.
	 *
	 * @defaultValue `1.0`
	 * @see {@link autoRotate}
	 */
	autoRotateSpeed: number = 1.0;

	private _animation: PlayerAnimation | null;
	private clock: Clock;

	private animationID: number | null;
	private onContextLost: (event: Event) => void;
	private onContextRestored: () => void;

	private _pixelRatio: number | "match-device";
	private devicePixelRatioQuery: MediaQueryList | null;
	private onDevicePixelRatioChange: () => void;

	private _nameTag: NameTagObject | null = null;
	private nameTagYOffset: number = 20;

	constructor(options: SkinViewerOptions = {}) {
		this.canvas = options.canvas === undefined ? document.createElement("canvas") : options.canvas;

		this.skinCanvas = document.createElement("canvas");
		this.armorHelmetCanvas = document.createElement("canvas");
		this.armorChestplateCanvas = document.createElement("canvas");
		this.armorLeggingsCanvas = document.createElement("canvas");
		this.armorBootsCanvas = document.createElement("canvas");
		this.capeCanvas = document.createElement("canvas");
		this.earsCanvas = document.createElement("canvas");

		this.scene = new Scene();
		this.camera = new PerspectiveCamera();
		this.camera.add(this.cameraLight);
		this.scene.add(this.camera);
		this.scene.add(this.globalLight);
		ColorManagement.enabled = false;

		this.renderer = new WebGLRenderer({
			canvas: this.canvas,
			preserveDrawingBuffer: options.preserveDrawingBuffer === true, // default: false
		});

		this.onDevicePixelRatioChange = () => {
			this.renderer.setPixelRatio(window.devicePixelRatio);
			this.updateComposerSize();

			if (this._pixelRatio === "match-device") {
				this.devicePixelRatioQuery = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
				this.devicePixelRatioQuery.addEventListener("change", this.onDevicePixelRatioChange, { once: true });
			}
		};
		if (options.pixelRatio === undefined || options.pixelRatio === "match-device") {
			this._pixelRatio = "match-device";
			this.devicePixelRatioQuery = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
			this.devicePixelRatioQuery.addEventListener("change", this.onDevicePixelRatioChange, { once: true });
			this.renderer.setPixelRatio(window.devicePixelRatio);
		} else {
			this._pixelRatio = options.pixelRatio;
			this.devicePixelRatioQuery = null;
			this.renderer.setPixelRatio(options.pixelRatio);
		}

		this.renderer.setClearColor(0, 0);

		let renderTarget;
		if (this.renderer.capabilities.isWebGL2) {
			// Use float precision depth if possible
			// see https://github.com/bs-community/skinview3d/issues/111
			renderTarget = new WebGLRenderTarget(0, 0, {
				depthTexture: new DepthTexture(0, 0, FloatType),
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
		this.playerObject.armors.visible = false;
		this.playerWrapper = new Group();
		this.playerWrapper.add(this.playerObject);
		this.scene.add(this.playerWrapper);

		this.controls = new OrbitControls(this.camera, this.canvas);
		this.controls.enablePan = false; // disable pan by default
		this.controls.minDistance = 10;
		this.controls.maxDistance = 256;

		if (options.enableControls === false) {
			this.controls.enabled = false;
		}

		if (options.skin !== undefined) {
			this.loadSkin(options.skin, {
				model: options.model,
				ears: options.ears === "current-skin",
			});
		}
		if (options.armors !== undefined) {
			this.loadArmors(options.armors);
		}
		if (options.cape !== undefined) {
			this.loadCape(options.cape);
		}
		if (options.ears !== undefined && options.ears !== "current-skin") {
			this.loadEars(options.ears.source, {
				textureType: options.ears.textureType,
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
		if (options.nameTag !== undefined) {
			this.nameTag = options.nameTag;
		}
		this.camera.position.z = 1;
		this._zoom = options.zoom === undefined ? 0.9 : options.zoom;
		this.fov = options.fov === undefined ? 50 : options.fov;

		this._animation = options.animation === undefined ? null : options.animation;
		this.clock = new Clock();

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
		this.canvas.addEventListener(
			"mousedown",
			() => {
				this.isUserRotating = true;
			},
			false
		);
		this.canvas.addEventListener(
			"mouseup",
			() => {
				this.isUserRotating = false;
			},
			false
		);
		this.canvas.addEventListener(
			"touchmove",
			e => {
				if (e.touches.length === 1) {
					this.isUserRotating = true;
				} else {
					this.isUserRotating = false;
				}
			},
			false
		);
		this.canvas.addEventListener(
			"touchend",
			() => {
				this.isUserRotating = false;
			},
			false
		);
	}

	private updateComposerSize(): void {
		this.composer.setSize(this.width, this.height);
		const pixelRatio = this.renderer.getPixelRatio();
		this.composer.setPixelRatio(pixelRatio);
		this.fxaaPass.material.uniforms["resolution"].value.x = 1 / (this.width * pixelRatio);
		this.fxaaPass.material.uniforms["resolution"].value.y = 1 / (this.height * pixelRatio);
	}

	private recreateArmorTexture(): void {
		[this.armorHelmetTexture, this.armorChestplateTexture, this.armorLeggingsTexture, this.armorBootsTexture].forEach(
			texture => {
				if (texture !== null) {
					texture.dispose();
				}
			}
		);
		this.armorHelmetTexture = new CanvasTexture(this.armorHelmetCanvas);
		this.armorHelmetTexture.magFilter = NearestFilter;
		this.armorHelmetTexture.minFilter = NearestFilter;
		this.armorChestplateTexture = new CanvasTexture(this.armorChestplateCanvas);
		this.armorChestplateTexture.magFilter = NearestFilter;
		this.armorChestplateTexture.minFilter = NearestFilter;
		this.armorLeggingsTexture = new CanvasTexture(this.armorLeggingsCanvas);
		this.armorLeggingsTexture.magFilter = NearestFilter;
		this.armorLeggingsTexture.minFilter = NearestFilter;
		this.armorBootsTexture = new CanvasTexture(this.armorBootsCanvas);
		this.armorBootsTexture.magFilter = NearestFilter;
		this.armorBootsTexture.minFilter = NearestFilter;
		this.playerObject.armors.setArmorMaps(
			this.armorHelmetTexture,
			this.armorChestplateTexture,
			this.armorLeggingsTexture,
			this.armorBootsTexture
		);
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
		this.playerObject.ears.map = this.earsTexture;
	}
	loadArmors(empty: null): void | Promise<void>;
	loadArmors(textures: ArmorTexture | null): void | Promise<void>;
	loadArmors(textures: ArmorTexture | null) {
		if (!textures) {
			this.resetArmors();
			return;
		}

		let texturesCopy: NormalizedArmor = {
			helmet: textures.helmet ?? textures.main ?? null,
			chestplate: textures.chestplate ?? textures.main ?? null,
			leggings: textures.leggings ?? textures.legs ?? null,
			boots: textures.boots ?? textures.main ?? null,
		};
		const syncImages: ArmorTexture = {};
		const asyncPromises: Promise<void>[] = [];

		(Object.keys(texturesCopy) as Array<keyof NormalizedArmor>).forEach(key => {
			if (texturesCopy[key] === null) {
				syncImages[key] = null;
			} else if (isTextureSource(texturesCopy[key])) {
				syncImages[key] = texturesCopy[key] as TextureSource;
			} else {
				asyncPromises.push(
					loadImage(texturesCopy[key] as RemoteImage).then(img => {
						syncImages[key] = img;
					})
				);
			}
		});

		if (asyncPromises.length > 0) {
			return Promise.all(asyncPromises).then(() => {
				this._applyArmorTextures(syncImages as NormalizedArmor);
			});
		} else {
			this._applyArmorTextures(syncImages as NormalizedArmor);
		}
	}

	private inferArmorType(texture: TextureSource): "legs" | "main" {
		const canvas = document.createElement("canvas");
		canvas.width = texture.width;
		canvas.height = texture.height;
		const ctx = canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
		ctx.drawImage(texture, 0, 0, texture.width, texture.height);

		const scale = canvas.width / 64;
		const x = 0;
		const y = 0;
		const w = Math.floor(32 * scale);
		const h = Math.floor(16 * scale);

		const imgData = ctx.getImageData(x, y, w, h);
		const data = imgData.data;
		const pixelCount = w * h;

		let allTransparent = true;
		let allBlack = true;
		let allWhite = true;

		for (let i = 0; i < pixelCount; i++) {
			const offset = i * 4;
			const r = data[offset];
			const g = data[offset + 1];
			const b = data[offset + 2];
			const a = data[offset + 3];

			if (a !== 0) allTransparent = false;
			if (!(r === 0 && g === 0 && b === 0 && a === 255)) allBlack = false;
			if (!(r === 255 && g === 255 && b === 255 && a === 255)) allWhite = false;

			if (!allTransparent && !allBlack && !allWhite) {
				return "main";
			}
		}

		return allTransparent || allBlack || allWhite ? "legs" : "main";
	}

	private _applyArmorTextures(textures: NormalizedArmor): void {
		const helmet = textures.helmet as TextureSource;
		const chestplate = textures.chestplate as TextureSource;
		const leggings = textures.leggings as TextureSource;
		const boots = textures.boots as TextureSource;
		const inferArmorType = this.inferArmorType;
		const armorTypeMap: Record<keyof NormalizedArmor, "main" | "legs"> = {
			helmet: "main",
			chestplate: "main",
			leggings: "legs",
			boots: "main",
		};

		const armorNames = ["helmet", "chestplate", "leggings", "boots"];
		function setInvalidTextureWarn(type: keyof NormalizedArmor) {
			if (textures[type] && inferArmorType(textures[type] as TextureSource) != armorTypeMap[type]) {
				console.warn(`Invalid texture , from ${type}`);
			}
		}
		armorNames.forEach(key => {
			setInvalidTextureWarn(key as keyof NormalizedArmor);
		});
		if (this.contexts.length === 0) {
			this.contexts = [
				this.armorHelmetCanvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D,
				this.armorChestplateCanvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D,
				this.armorLeggingsCanvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D,
				this.armorBootsCanvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D,
			];
		}

		[this.armorHelmetCanvas, this.armorChestplateCanvas, this.armorLeggingsCanvas, this.armorBootsCanvas].forEach(
			(canvas, index) => {
				if (textures[armorNames[index] as keyof NormalizedArmor]) {
					const sideLength = (textures[armorNames[index] as keyof NormalizedArmor] as TextureSource).width;
					canvas.width = sideLength;
					canvas.height = sideLength;
				}
				(canvas.getContext("2d") as CanvasRenderingContext2D).clearRect(0, 0, canvas.width, canvas.height);
			}
		);

		if (helmet) this.contexts[0].drawImage(helmet as CanvasImageSource, 0, 0, helmet.width, helmet.width / 2);
		if (chestplate)
			this.contexts[1].drawImage(chestplate as CanvasImageSource, 0, 0, chestplate.width, chestplate.width / 2);
		if (leggings) this.contexts[2].drawImage(leggings as CanvasImageSource, 0, 0, leggings.width, leggings.width / 2);
		if (boots) this.contexts[3].drawImage(boots as CanvasImageSource, 0, 0, boots.width, boots.width / 2);

		this.recreateArmorTexture();
		this.playerObject.armors.visible = true;
		this.playerObject.armors.headArmor && (this.playerObject.armors.headArmor.visible = !!helmet);
		this.playerObject.armors.bodyArmor && (this.playerObject.armors.bodyArmor.visible = !!chestplate || !!leggings);
		this.playerObject.armors.leftArmArmor && (this.playerObject.armors.leftArmArmor.visible = !!chestplate);
		this.playerObject.armors.rightArmArmor && (this.playerObject.armors.rightArmArmor.visible = !!chestplate);
		this.playerObject.armors.leftLegArmor && (this.playerObject.armors.leftLegArmor.visible = !!leggings || !!boots);
		this.playerObject.armors.rightLegArmor && (this.playerObject.armors.rightLegArmor.visible = !!leggings || !!boots);
		this.playerObject.armors.bodyArmor2 && (this.playerObject.armors.bodyArmor2.visible = !!chestplate || !!leggings);
		this.playerObject.armors.leftLegArmor2 && (this.playerObject.armors.leftLegArmor2.visible = !!leggings || !!boots);
		this.playerObject.armors.rightLegArmor2 &&
			(this.playerObject.armors.rightLegArmor2.visible = !!leggings || !!boots);
	}

	loadSkin(empty: null): void;
	loadSkin<S extends TextureSource | RemoteImage>(
		source: S,
		options?: SkinLoadOptions
	): S extends TextureSource ? void : Promise<void>;

	loadSkin(source: TextureSource | RemoteImage | null, options: SkinLoadOptions = {}): void | Promise<void> {
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
			if (options.armors !== undefined) {
				this.loadArmors(options.armors);
			}
			if (options.makeVisible !== false) {
				this.playerObject.skin.visible = true;
			}

			if (options.ears === true || options.ears == "load-only") {
				loadEarsToCanvasFromSkin(this.earsCanvas, source);
				this.recreateEarsTexture();
				if (options.ears === true) {
					this.playerObject.ears.visible = true;
					if (this._nameTag) {
						this.nameTagYOffset = 25;
						this._nameTag.position.y = this.nameTagYOffset;
					}
				}
			}
		} else {
			return loadImage(source).then(image => this.loadSkin(image, options));
		}
	}
	resetArmors(): void {
		this.playerObject.armors.visible = false;
		this.playerObject.armors.headArmor && (this.playerObject.armors.headArmor.visible = false);
		this.playerObject.armors.bodyArmor && (this.playerObject.armors.bodyArmor.visible = false);
		this.playerObject.armors.leftArmArmor && (this.playerObject.armors.leftArmArmor.visible = false);
		this.playerObject.armors.rightArmArmor && (this.playerObject.armors.rightArmArmor.visible = false);
		this.playerObject.armors.leftLegArmor && (this.playerObject.armors.leftLegArmor.visible = false);
		this.playerObject.armors.rightLegArmor && (this.playerObject.armors.rightLegArmor.visible = false);
		this.playerObject.armors.bodyArmor2 && (this.playerObject.armors.bodyArmor2.visible = false);
		this.playerObject.armors.leftLegArmor2 && (this.playerObject.armors.leftLegArmor2.visible = false);
		this.playerObject.armors.rightLegArmor2 && (this.playerObject.armors.rightLegArmor2.visible = false);
		this.playerObject.armors.headArmor &&
			((this.playerObject.armors.headArmor.material as MeshStandardMaterial).map = null);
		this.playerObject.armors.bodyArmor &&
			((this.playerObject.armors.bodyArmor.material as MeshStandardMaterial).map = null);
		this.playerObject.armors.leftArmArmor &&
			((this.playerObject.armors.leftArmArmor.material as MeshStandardMaterial).map = null);
		this.playerObject.armors.rightArmArmor &&
			((this.playerObject.armors.rightArmArmor.material as MeshStandardMaterial).map = null);
		this.playerObject.armors.leftLegArmor &&
			((this.playerObject.armors.leftLegArmor.material as MeshStandardMaterial).map = null);
		this.playerObject.armors.rightLegArmor &&
			((this.playerObject.armors.rightLegArmor.material as MeshStandardMaterial).map = null);
		this.playerObject.armors.bodyArmor2 &&
			((this.playerObject.armors.bodyArmor2.material as MeshStandardMaterial).map = null);
		this.playerObject.armors.leftLegArmor2 &&
			((this.playerObject.armors.leftLegArmor2.material as MeshStandardMaterial).map = null);
		this.playerObject.armors.rightLegArmor2 &&
			((this.playerObject.armors.rightLegArmor2.material as MeshStandardMaterial).map = null);
		[this.armorHelmetTexture, this.armorChestplateTexture, this.armorLeggingsTexture, this.armorBootsTexture].forEach(
			texture => {
				if (texture !== null) {
					texture.dispose();
					texture = null;
				}
			}
		);
	}
	resetSkin(): void {
		this.playerObject.skin.visible = false;
		this.playerObject.skin.map = null;
		this.resetArmors();
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

	loadCape(source: TextureSource | RemoteImage | null, options: CapeLoadOptions = {}): void | Promise<void> {
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

	loadEars(source: TextureSource | RemoteImage | null, options: EarsLoadOptions = {}): void | Promise<void> {
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
				if (this._nameTag) {
					this.nameTagYOffset = 25;
					this._nameTag.position.y = this.nameTagYOffset;
				}
			}
		} else {
			return loadImage(source).then(image => this.loadEars(image, options));
		}
	}

	resetEars(): void {
		this.playerObject.ears.visible = false;
		if (this._nameTag) {
			this.nameTagYOffset = 20;
			this._nameTag.position.y = this.nameTagYOffset;
		}
		this.playerObject.ears.map = null;
		if (this.earsTexture !== null) {
			this.earsTexture.dispose();
			this.earsTexture = null;
		}
	}

	loadPanorama<S extends TextureSource | RemoteImage>(source: S): S extends TextureSource ? void : Promise<void> {
		return this.loadBackground(source, EquirectangularReflectionMapping);
	}

	loadBackground<S extends TextureSource | RemoteImage>(
		source: S,
		mapping?: Mapping
	): S extends TextureSource ? void : Promise<void>;

	loadBackground<S extends TextureSource | RemoteImage>(source: S, mapping?: Mapping): void | Promise<void> {
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
		const dt = this.clock.getDelta();
		if (this._animation !== null) {
			this._animation.update(this.playerObject, dt);
			if (this._nameTag) {
				this._nameTag.position.y =
					this.playerObject.skin.head.getWorldPosition(new Vector3()).y + this.nameTagYOffset - 8;
			}
		}
		if (this.autoRotate) {
			if (!(this.controls.enableRotate && this.isUserRotating)) {
				this.playerWrapper.rotation.y += dt * this.autoRotateSpeed;
			}
		}
		this.controls.update();
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

		if (this.devicePixelRatioQuery !== null) {
			this.devicePixelRatioQuery.removeEventListener("change", this.onDevicePixelRatioChange);
			this.devicePixelRatioQuery = null;
		}

		if (this.animationID !== null) {
			window.cancelAnimationFrame(this.animationID);
			this.animationID = null;
		}

		this.controls.dispose();
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
			this.clock.stop();
			this.clock.autoStart = true;
		} else if (
			!this._renderPaused &&
			!this._disposed &&
			!this.renderer.getContext().isContextLost() &&
			this.animationID == null
		) {
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
		let distance = 4.5 + 16.5 / Math.tan(((this.fov / 180) * Math.PI) / 2) / this.zoom;

		// limit distance between 10 ~ 256 (default min / max distance of OrbitControls)
		if (distance < 10) {
			distance = 10;
		} else if (distance > 256) {
			distance = 256;
		}

		this.camera.position.multiplyScalar(distance / this.camera.position.length());
		this.camera.updateProjectionMatrix();
	}

	resetCameraPose(): void {
		this.camera.position.set(0, 0, 1);
		this.camera.rotation.set(0, 0, 0);
		this.adjustCameraDistance();
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

	get pixelRatio(): number | "match-device" {
		return this._pixelRatio;
	}

	set pixelRatio(newValue: number | "match-device") {
		if (newValue === "match-device") {
			if (this._pixelRatio !== "match-device") {
				this._pixelRatio = newValue;
				this.onDevicePixelRatioChange();
			}
		} else {
			if (this._pixelRatio === "match-device" && this.devicePixelRatioQuery !== null) {
				this.devicePixelRatioQuery.removeEventListener("change", this.onDevicePixelRatioChange);
				this.devicePixelRatioQuery = null;
			}
			this._pixelRatio = newValue;
			this.renderer.setPixelRatio(newValue);
			this.updateComposerSize();
		}
	}

	/**
	 * The animation that is current playing, or `null` if no animation is playing.
	 *
	 * Setting this property to a different value will change the current animation.
	 * The player's pose and the progress of the new animation will be reset before playing.
	 *
	 * Setting this property to `null` will stop the current animation and reset the player's pose.
	 */
	get animation(): PlayerAnimation | null {
		return this._animation;
	}

	set animation(animation: PlayerAnimation | null) {
		if (this._animation !== animation) {
			this.playerObject.resetJoints();
			this.playerObject.position.set(0, 0, 0);
			this.playerObject.rotation.set(0, 0, 0);
			if (this._nameTag) {
				this._nameTag.position.y = this.nameTagYOffset;
			}
			this.clock.stop();
			this.clock.autoStart = true;
		}
		if (animation !== null) {
			animation.progress = 0;
		}
		this._animation = animation;
	}

	/**
	 * The name tag to display above the player, or `null` if there is none.
	 *
	 * When setting this property to a `string` value, a {@link NameTagObject}
	 * will be automatically created with default options.
	 *
	 * @example
	 * ```
	 * skinViewer.nameTag = "hello";
	 * skinViewer.nameTag = new NameTagObject("hello", { textStyle: "yellow" });
	 * skinViewer.nameTag = null;
	 * ```
	 */
	get nameTag(): NameTagObject | null {
		return this._nameTag;
	}

	set nameTag(newVal: NameTagObject | string | null) {
		if (this._nameTag !== null) {
			// Remove the old name tag from the scene
			this.playerWrapper.remove(this._nameTag);
		}

		if (newVal !== null) {
			if (!(newVal instanceof Object3D)) {
				newVal = new NameTagObject(newVal);
			}

			// Add the new name tag to the scene
			this.playerWrapper.add(newVal);
			// Set y position
			this.nameTagYOffset = this.playerObject.ears.visible ? 25 : 20;
			newVal.position.y = this.nameTagYOffset;
		}

		this._nameTag = newVal;
	}
}
