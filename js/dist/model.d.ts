import { Group, Mesh, MeshBasicMaterial, Object3D } from "three";
/**
 * Notice that innerLayer and outerLayer may NOT be the direct children of the Group.
 */
export declare class BodyPart extends Group {
    readonly innerLayer: Object3D;
    readonly outerLayer: Object3D;
    constructor(innerLayer: Object3D, outerLayer: Object3D);
}
export declare class SkinObject extends Group {
    readonly head: BodyPart;
    readonly body: BodyPart;
    readonly rightArm: BodyPart;
    readonly leftArm: BodyPart;
    readonly rightLeg: BodyPart;
    readonly leftLeg: BodyPart;
    private modelListeners;
    private _slim;
    constructor(layer1Material: MeshBasicMaterial, layer2Material: MeshBasicMaterial);
    get slim(): boolean;
    set slim(value: boolean);
    private getBodyParts;
    setInnerLayerVisible(value: boolean): void;
    setOuterLayerVisible(value: boolean): void;
}
export declare class CapeObject extends Group {
    readonly cape: Mesh;
    constructor(capeMaterial: MeshBasicMaterial);
}
export declare class PlayerObject extends Group {
    readonly skin: SkinObject;
    readonly cape: CapeObject;
    constructor(layer1Material: MeshBasicMaterial, layer2Material: MeshBasicMaterial, capeMaterial: MeshBasicMaterial);
}
