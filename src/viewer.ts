import * as THREE from "three";
import { PlayerObject } from "./model";
import { invokeAnimation } from "./animation";
import { loadSkinToCanvas, loadCapeToCanvas, isSlimSkin } from "./utils";

export interface SkinViewerOptions {
	domElement: Node;
	animation?: Animation;
	skinUrl?: string;
	capeUrl?: string;
	width?: number;
	height?: number;
	detectModel?: boolean;
}

export class SkinViewer {

	public readonly domElement: Node;
	public animation: Animation | null;
	public detectModel: boolean = true;
	public animationPaused: boolean = false;
	public animationTime: number = 0;
	public disposed: boolean = false;

	public readonly skinImg: HTMLImageElement;
	public readonly skinCanvas: HTMLCanvasElement;
	public readonly skinTexture: THREE.Texture;

	public readonly capeImg: HTMLImageElement;
	public readonly capeCanvas: HTMLCanvasElement;
	public readonly capeTexture: THREE.Texture;

	public readonly layer1Material: THREE.MeshBasicMaterial;
	public readonly layer2Material: THREE.MeshBasicMaterial;
	public readonly capeMaterial: THREE.MeshBasicMaterial;

	public readonly scene: THREE.Scene;
	public readonly camera: THREE.PerspectiveCamera;
	public readonly renderer: THREE.WebGLRenderer;

	public readonly playerObject: PlayerObject;

	private _renderPaused: boolean = false;

	constructor(options: SkinViewerOptions) {
		this.domElement = options.domElement;
		this.animation = options.animation || null;
		if (options.detectModel === false) {
			this.detectModel = false;
		}

		// texture
		this.skinImg = new Image();
		this.skinCanvas = document.createElement("canvas");
		this.skinTexture = new THREE.Texture(this.skinCanvas);
		this.skinTexture.magFilter = THREE.NearestFilter;
		this.skinTexture.minFilter = THREE.NearestFilter;

		this.capeImg = new Image();
		this.capeCanvas = document.createElement("canvas");
		this.capeTexture = new THREE.Texture(this.capeCanvas);
		this.capeTexture.magFilter = THREE.NearestFilter;
		this.capeTexture.minFilter = THREE.NearestFilter;

		this.layer1Material = new THREE.MeshBasicMaterial({ map: this.skinTexture, side: THREE.FrontSide });
		this.layer2Material = new THREE.MeshBasicMaterial({ map: this.skinTexture, transparent: true, opacity: 1, side: THREE.DoubleSide, alphaTest: 0.5 });
		this.capeMaterial = new THREE.MeshBasicMaterial({ map: this.capeTexture, transparent: true, opacity: 1, side: THREE.DoubleSide, alphaTest: 0.5 });

		// scene
		this.scene = new THREE.Scene();

		// Use smaller fov to avoid distortion
		this.camera = new THREE.PerspectiveCamera(40);
		this.camera.position.y = -12;
		this.camera.position.z = 60;

		this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
		this.renderer.setSize(300, 300); // default size
		this.renderer.context.getShaderInfoLog = () => ""; // shut firefox up
		this.domElement.appendChild(this.renderer.domElement);

		this.playerObject = new PlayerObject(this.layer1Material, this.layer2Material, this.capeMaterial);
		this.playerObject.name = "player";
		this.scene.add(this.playerObject);

		// texture loading
		this.skinImg.crossOrigin = "anonymous";
		this.skinImg.onerror = () => console.error("Failed loading " + this.skinImg.src);
		this.skinImg.onload = () => {
			loadSkinToCanvas(this.skinCanvas, this.skinImg);

			if (this.detectModel) {
				this.playerObject.skin.slim = isSlimSkin(this.skinCanvas);
			}

			this.skinTexture.needsUpdate = true;
			this.layer1Material.needsUpdate = true;
			this.layer2Material.needsUpdate = true;

			this.playerObject.skin.visible = true;
		};

		this.capeImg.crossOrigin = "anonymous";
		this.capeImg.onerror = () => console.error("Failed loading " + this.capeImg.src);
		this.capeImg.onload = () => {
			loadCapeToCanvas(this.capeCanvas, this.capeImg);

			this.capeTexture.needsUpdate = true;
			this.capeMaterial.needsUpdate = true;

			this.playerObject.cape.visible = true;
		};

		if (options.skinUrl) this.skinUrl = options.skinUrl;
		if (options.capeUrl) this.capeUrl = options.capeUrl;
		if (options.width) this.width = options.width;
		if (options.height) this.height = options.height;

		window.requestAnimationFrame(() => this.draw());
	}

	private draw() {
		if (this.disposed || this._renderPaused) {
			return;
		}
		if (!this.animationPaused) {
			this.animationTime++;
			if (this.animation) {
				invokeAnimation(this.animation, this.playerObject, this.animationTime / 100.0);
			}
		}
		this.renderer.render(this.scene, this.camera);
		window.requestAnimationFrame(() => this.draw());
	}

	setSize(width, height) {
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
	}

	dispose() {
		this.disposed = true;
		this.domElement.removeChild(this.renderer.domElement);
		this.renderer.dispose();
		this.skinTexture.dispose();
		this.capeTexture.dispose();
	}

	get renderPaused() {
		return this._renderPaused;
	}

	set renderPaused(value: boolean) {
		const toResume = !this.disposed && !value && this._renderPaused;
		this._renderPaused = value;
		if (toResume) {
			window.requestAnimationFrame(() => this.draw());
		}
	}

	get skinUrl() {
		return this.skinImg.src;
	}

	set skinUrl(url) {
		this.skinImg.src = url;
	}

	get capeUrl() {
		return this.capeImg.src;
	}

	set capeUrl(url) {
		this.capeImg.src = url;
	}

	get width() {
		const target = new THREE.Vector2();
		return this.renderer.getSize(target).width;
	}

	set width(newWidth) {
		this.setSize(newWidth, this.height);
	}

	get height() {
		const target = new THREE.Vector2();
		return this.renderer.getSize(target).height;
	}

	set height(newHeight) {
		this.setSize(this.width, newHeight);
	}
}
