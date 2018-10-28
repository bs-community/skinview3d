import * as THREE from "three";
/**
 * Notice that innerLayer and outerLayer may NOT be the direct children of the Group.
 */
export declare class BodyPart extends THREE.Group {
    readonly innerLayer: THREE.Object3D;
    readonly outerLayer: THREE.Object3D;
    constructor(innerLayer: THREE.Object3D, outerLayer: THREE.Object3D);
}
export declare class SkinObject extends THREE.Group {
    readonly head: BodyPart;
    readonly body: BodyPart;
    readonly rightArm: BodyPart;
    readonly leftArm: BodyPart;
    readonly rightLeg: BodyPart;
    readonly leftLeg: BodyPart;
    private modelListeners;
    private _slim;
    constructor(layer1Material: THREE.MeshBasicMaterial, layer2Material: THREE.MeshBasicMaterial);
    slim: boolean;
    private getBodyParts;
    setInnerLayerVisible(value: boolean): void;
    setOuterLayerVisible(value: boolean): void;
}
export declare class CapeObject extends THREE.Group {
    readonly cape: THREE.Mesh;
    constructor(capeMaterial: THREE.MeshBasicMaterial);
}
export declare class PlayerObject extends THREE.Group {
    readonly skin: SkinObject;
    readonly cape: CapeObject;
    constructor(layer1Material: THREE.MeshBasicMaterial, layer2Material: THREE.MeshBasicMaterial, capeMaterial: THREE.MeshBasicMaterial);
}
