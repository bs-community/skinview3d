import { isTextureSource, loadImage, ModelType, RemoteImage, TextureSource } from "skinview-utils";
import { ColorRepresentation, Texture } from "three";
import { BackEquipment } from "./model.js";
import { SkinViewer } from "./viewer.js"

function loadTexture(texture?: RemoteImage | TextureSource): Promise<TextureSource> | TextureSource | undefined {
    if (texture !== undefined && !isTextureSource(texture)) {
        return loadImage(texture);
    } else {
        return texture;
    }
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
    return new Promise(resolve => canvas.toBlob(resolve));
}

export interface SkinPreviewOptions {
    width: number;
    height: number;
    pixelRatio?: number;

    skin?: RemoteImage | TextureSource;
    model?: ModelType | "auto-detect";

    cape?: RemoteImage | TextureSource;
    backEquipment?: BackEquipment;

    ears?: "current-skin" | {
        textureType: "standalone" | "skin",
        source: RemoteImage | TextureSource
    };

    background?: ColorRepresentation | Texture;

    panorama?: RemoteImage | TextureSource;

    /**
     * A callback that is called before rendering.
     * You can change the camera pose or the player pose in this function.
     */
    prepareFn?: (viewer: SkinViewer) => void;
}

export class SkinPreviewRenderer {

    private skinViewer: SkinViewer;

    constructor() {
        this.skinViewer = new SkinViewer({
            renderPaused: true,
            pixelRatio: window.devicePixelRatio
        });
    }

    private async render(options: SkinPreviewOptions): Promise<HTMLCanvasElement> {
        const [
            loadedSkin,
            loadedCape,
            loadedEars,
            loadedPanorama
        ] = await Promise.all([
            loadTexture(options.skin),
            loadTexture(options.cape),
            loadTexture(typeof options.ears === "object" ? options.ears.source : undefined),
            loadTexture(options.panorama),
        ]);

        this.skinViewer.setSize(options.width, options.height);

        if (options.pixelRatio === undefined) {
            this.skinViewer.pixelRatio = window.devicePixelRatio;
        } else {
            this.skinViewer.pixelRatio = options.pixelRatio;
        }

        if (loadedSkin === undefined) {
            this.skinViewer.resetSkin();
        } else {
            this.skinViewer.loadSkin(loadedSkin, {
                model: options.model,
                ears: options.ears === "current-skin"
            });
        }

        if (loadedCape === undefined) {
            this.skinViewer.resetCape();
        } else {
            this.skinViewer.loadCape(loadedCape, {
                backEquipment: options.backEquipment
            });
        }

        if (options.ears === undefined) {
            this.skinViewer.resetEars();
        } else if (typeof options.ears === "object" && loadedEars !== undefined) {
            this.skinViewer.loadEars(loadedEars, {
                textureType: options.ears.textureType
            });
        }

        if (loadedPanorama === undefined) {
            if (options.background === undefined) {
                this.skinViewer.background = null;
            } else {
                this.skinViewer.background = options.background;
            }
        } else {
            this.skinViewer.loadPanorama(loadedPanorama);
        }

        this.skinViewer.resetCameraPose();
        this.skinViewer.playerObject.resetJoints();

        if (options.prepareFn !== undefined) {
            options.prepareFn(this.skinViewer);
        }

        this.skinViewer.render();
        return this.skinViewer.canvas;
    }

    async renderBlob(options: SkinPreviewOptions): Promise<Blob> {
        const blob = await toBlob(await this.render(options));
        if (blob === null) {
            throw new Error("Failed to convert canvas to blob");
        }
        return blob;
    }

    async renderDataURL(options: SkinPreviewOptions): Promise<string> {
        return (await this.render(options)).toDataURL();
    }

    dispose(): void {
        this.skinViewer.dispose();
    }

    get disposed(): boolean {
        return this.skinViewer.disposed;
    }
}

// Pre-defined poses

export const ViewedFromFront = (viewer: SkinViewer) => {
    viewer.fov = 50;
    viewer.cameraLight.intensity = 0.4;
    viewer.globalLight.intensity = 0.6;
    viewer.camera.position.set(0, 0.5, 40);
    viewer.camera.rotation.set(0, 0, 0);
};

export const ViewedFromBack = (viewer: SkinViewer) => {
    viewer.fov = 50;
    viewer.cameraLight.intensity = 0.4;
    viewer.globalLight.intensity = 0.6;
    viewer.camera.position.set(0, 0.5, -40);
    viewer.camera.rotation.set(Math.PI, 0, Math.PI);
};

export const ViewedFromFrontLeft = (viewer: SkinViewer) => {
    viewer.fov = 30;
    viewer.cameraLight.intensity = 0.4;
    viewer.globalLight.intensity = 0.6;
    viewer.camera.position.set(31.2987, 34.3660, 47.1082);
    viewer.camera.rotation.set(-0.601987, 0.501003, 0.318746);
};

export const ViewedFromBackRight = (viewer: SkinViewer) => {
    viewer.fov = 30;
    viewer.cameraLight.intensity = 0.4;
    viewer.globalLight.intensity = 0.6;
    viewer.camera.position.set(-31.2987, 34.3660, -47.1082);
    viewer.camera.rotation.set(-2.539606, -0.501004, -2.822847);
};
