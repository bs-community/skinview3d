import * as THREE from "three";
import { Animation } from "./animation";
import { PlayerObject } from "./model";

export interface SkinViewerOptions {
	domElement: Node;
	animation?: Animation;
	slim?: boolean;
	skinUrl?: string;
	capeUrl?: string;
	width?: number;
	height?: number;
}

export class SkinViewer {
	public readonly domElement: Node;
	public readonly disposed: boolean;
	public width: number;
	public height: number;
	public skinUrl: string;
	public capeUrl: string;
	public animation: Animation;
	public animationPaused: boolean;
	public animationTime: number;
	public readonly playerObject: PlayerObject;
	public readonly scene: THREE.Scene;
	public readonly camera: THREE.PerspectiveCamera;
	public readonly renderer: THREE.Renderer;

	constructor(options: SkinViewerOptions);

	public setSize(width: number, height: number): void;

	public dispose(): void;
}

export class SkinControl {
	public enableAnimationControl: boolean;
	public readonly skinViewer: SkinViewer;

	constructor(skinViewer: SkinViewer);

	public dispose(): void;
}
