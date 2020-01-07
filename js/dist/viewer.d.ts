import { MeshBasicMaterial, PerspectiveCamera, Scene, Texture, WebGLRenderer } from "three";
import { RootAnimation } from "./animation";
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
    readonly animations: RootAnimation;
    detectModel: boolean;
    disposed: boolean;
    readonly skinImg: HTMLImageElement;
    readonly skinCanvas: HTMLCanvasElement;
    readonly skinTexture: Texture;
    readonly capeImg: HTMLImageElement;
    readonly capeCanvas: HTMLCanvasElement;
    readonly capeTexture: Texture;
    readonly layer1Material: MeshBasicMaterial;
    readonly layer2Material: MeshBasicMaterial;
    readonly capeMaterial: MeshBasicMaterial;
    readonly scene: Scene;
    readonly camera: PerspectiveCamera;
    readonly renderer: WebGLRenderer;
    readonly playerObject: PlayerObject;
    private _renderPaused;
    constructor(options: SkinViewerOptions);
    private draw;
    setSize(width: number, height: number): void;
    dispose(): void;
    get renderPaused(): boolean;
    set renderPaused(value: boolean);
    get skinUrl(): string;
    set skinUrl(url: string);
    get capeUrl(): string;
    set capeUrl(url: string);
    get width(): number;
    set width(newWidth: number);
    get height(): number;
    set height(newHeight: number);
}
