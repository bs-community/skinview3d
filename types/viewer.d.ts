import * as THREE from "three";
import { CompositeAnimation, WalkAnimation } from "./animation";
import { Animation } from "./animation";
import { PlayerObject } from "./model";

interface SkinViewerOptions {
	domElement: Node;
	animation?: Animation;
	slim?: boolean;
	skinUrl?: string;
	capeUrl?: string;
	width?: number;
	height?: number;
}

export class SkinViewer {
	public skinUrl: string;
	public capeUrl: string;
	public width: number;
	public height: number;
	public readonly domElement: Node;
	public animation: Animation;
	public animationPaused: boolean;
	public animationTime: number;
	public readonly playerObject: PlayerObject;
	public readonly disposed: boolean;
	public readonly camera: THREE.Camera;
	public readonly renderer: THREE.Renderer;
	public readonly scene: THREE.Scene;

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
