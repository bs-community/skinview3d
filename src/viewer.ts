import { NearestFilter, PerspectiveCamera, Scene, Texture, Vector2, WebGLRenderer } from "three";
import { RootAnimation } from "./animation.js";
import { PlayerObject } from "./model.js";
import { isSlimSkin, loadCapeToCanvas, loadSkinToCanvas } from "skinview-utils";

export interface SkinViewerOptions {
	domElement: Node;
	skinUrl?: string;
	capeUrl?: string;
	width?: number;
	height?: number;
	detectModel?: boolean;
}

export class SkinViewer {

	public readonly domElement: Node;
	public readonly animations: RootAnimation = new RootAnimation();
	public detectModel: boolean = true;

	public readonly skinImg: HTMLImageElement;
	public readonly skinCanvas: HTMLCanvasElement;
	public readonly skinTexture: Texture;

	public readonly capeImg: HTMLImageElement;
	public readonly capeCanvas: HTMLCanvasElement;
	public readonly capeTexture: Texture;

	public readonly scene: Scene;
	public readonly camera: PerspectiveCamera;
	public readonly renderer: WebGLRenderer;

	public readonly playerObject: PlayerObject;

	private _disposed: boolean = false;
	private _renderPaused: boolean = false;
	private _skinSet: boolean = false;
	private _capeSet: boolean = false;

	constructor(options: SkinViewerOptions) {
		this.domElement = options.domElement;
		if (options.detectModel === false) {
			this.detectModel = false;
		}

		// texture
		this.skinImg = new Image();
		this.skinCanvas = document.createElement("canvas");
		this.skinTexture = new Texture(this.skinCanvas);
		this.skinTexture.magFilter = NearestFilter;
		this.skinTexture.minFilter = NearestFilter;

		this.capeImg = new Image();
		this.capeCanvas = document.createElement("canvas");
		this.capeTexture = new Texture(this.capeCanvas);
		this.capeTexture.magFilter = NearestFilter;
		this.capeTexture.minFilter = NearestFilter;

		// scene
		this.scene = new Scene();

		// Use smaller fov to avoid distortion
		this.camera = new PerspectiveCamera(40);
		this.camera.position.y = -12;
		this.camera.position.z = 60;

		this.renderer = new WebGLRenderer({ alpha: true });
		this.domElement.appendChild(this.renderer.domElement);

		this.playerObject = new PlayerObject(this.skinTexture, this.capeTexture);
		this.playerObject.name = "player";
		this.playerObject.skin.visible = false;
		this.playerObject.cape.visible = false;
		this.scene.add(this.playerObject);

		// texture loading
		this.skinImg.crossOrigin = "anonymous";
		this.skinImg.onerror = (): void => console.error("Failed loading " + this.skinImg.src);
		this.skinImg.onload = (): void => {
			loadSkinToCanvas(this.skinCanvas, this.skinImg);

			if (this.detectModel) {
				this.playerObject.skin.slim = isSlimSkin(this.skinCanvas);
			}

			this.skinTexture.needsUpdate = true;
			this.playerObject.skin.visible = true;
		};

		this.capeImg.crossOrigin = "anonymous";
		this.capeImg.onerror = (): void => console.error("Failed loading " + this.capeImg.src);
		this.capeImg.onload = (): void => {
			loadCapeToCanvas(this.capeCanvas, this.capeImg);

			this.capeTexture.needsUpdate = true;
			this.playerObject.cape.visible = true;
		};

		if (options.skinUrl !== undefined) {
			this.skinUrl = options.skinUrl;
		}
		if (options.capeUrl !== undefined) {
			this.capeUrl = options.capeUrl;
		}
		this.width = options.width === undefined ? 300 : options.width;
		this.height = options.height === undefined ? 300 : options.height;

		window.requestAnimationFrame(() => this.draw());
	}

	private draw(): void {
		if (this.disposed || this._renderPaused) {
			return;
		}
		this.animations.runAnimationLoop(this.playerObject);
		this.doRender();
		window.requestAnimationFrame(() => this.draw());
	}

	protected doRender(): void {
		this.renderer.render(this.scene, this.camera);
	}

	setSize(width: number, height: number): void {
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
	}

	dispose(): void {
		this._disposed = true;
		this.domElement.removeChild(this.renderer.domElement);
		this.renderer.dispose();
		this.skinTexture.dispose();
		this.capeTexture.dispose();
	}

	get disposed(): boolean {
		return this._disposed;
	}

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

	get skinUrl(): string | null {
		return this._skinSet ? this.skinImg.src : null;
	}

	set skinUrl(url: string | null) {
		if (url === null) {
			this._skinSet = false;
			this.playerObject.skin.visible = false;
		} else {
			this._skinSet = true;
			this.skinImg.src = url;
		}
	}

	get capeUrl(): string | null {
		return this._capeSet ? this.capeImg.src : null;
	}

	set capeUrl(url: string | null) {
		if (url === null) {
			this._capeSet = false;
			this.playerObject.cape.visible = false;
		} else {
			this._capeSet = true;
			this.capeImg.src = url;
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
