import * as THREE from "three";
import { PlayerObject } from "./model";
export interface SkinViewerOptions {
    domElement: Node;
    animation?: Animation;
    skinUrl?: string;
    capeUrl?: string;
    width?: number;
    height?: number;
    detectModel?: boolean;
}
export declare class SkinViewer {
    readonly domElement: Node;
    animation: Animation | null;
    detectModel: boolean;
    animationPaused: boolean;
    animationTime: number;
    disposed: boolean;
    readonly skinImg: HTMLImageElement;
    readonly skinCanvas: HTMLCanvasElement;
    readonly skinTexture: THREE.Texture;
    readonly capeImg: HTMLImageElement;
    readonly capeCanvas: HTMLCanvasElement;
    readonly capeTexture: THREE.Texture;
    readonly layer1Material: THREE.MeshBasicMaterial;
    readonly layer2Material: THREE.MeshBasicMaterial;
    readonly capeMaterial: THREE.MeshBasicMaterial;
    readonly scene: THREE.Scene;
    readonly camera: THREE.PerspectiveCamera;
    readonly renderer: THREE.WebGLRenderer;
    readonly playerObject: PlayerObject;
    constructor(options: SkinViewerOptions);
    setSize(width: any, height: any): void;
    dispose(): void;
    skinUrl: string;
    capeUrl: string;
    width: number;
    height: number;
}
