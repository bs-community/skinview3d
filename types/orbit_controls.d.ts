import * as THREE from "three";
import { SkinViewer } from "./viewer";

export class OrbitControls {

	public readonly object: THREE.Camera;
	public readonly domElement: HTMLElement | HTMLDocument;

	public enabled: boolean;
	public target: THREE.Vector3;

	public minDistance: number;
	public maxDistance: number;

	public minZoom: number;
	public maxZoom: number;

	public minPolarAngle: number;
	public maxPolarAngle: number;

	public minAzimuthAngle: number;
	public maxAzimuthAngle: number;

	public enableDamping: boolean;
	public dampingFactor: number;

	public enableZoom: boolean;
	public zoomSpeed: number;

	public enableRotate: boolean;
	public rotateSpeed: number;

	public enablePan: boolean;
	public keyPanSpeed: number;

	public autoRotate: boolean;
	public autoRotateSpeed: number;

	public enableKeys: boolean;
	public keys: { LEFT: number, UP: number, RIGHT: number, BOTTOM: number };

	public mouseButtons: { ORBIT: THREE.MOUSE, ZOOM: THREE.MOUSE, PAN: THREE.MOUSE };

	constructor(object: THREE.Camera, domElement?: HTMLElement);

	public getPolarAngle(): number;
	public getAzimuthalAngle(): number;

	public saveState(): void;
	public reset(): void;

	public update(): boolean;

	public dispose(): void;
}

export function createOrbitControls(skinViewer: SkinViewer): OrbitControls;
