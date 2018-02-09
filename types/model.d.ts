import * as THREE from "three";

export class SkinObject extends THREE.Group {
	public readonly slim: boolean;
	public readonly head: THREE.Group;
	public readonly body: THREE.Group;
	public readonly rightArm: THREE.Group;
	public readonly leftArm: THREE.Group;
	public readonly rightLeg: THREE.Group;
	public readonly leftLeg: THREE.Group;

	constructor(
		slim: boolean,
		layer1Material: THREE.Material,
		layer2Material: THREE.Material,
	);
}

export class CapeObject extends THREE.Group {
	public readonly cape: THREE.Mesh;

	constructor(capeMaterial: THREE.Material);
}

export class PlayerObject extends THREE.Group {
	public readonly skin: SkinObject;
	public readonly cape: CapeObject;

	constructor(
		slim: boolean,
		layer1Material: THREE.Material,
		layer2Material: THREE.Material,
		capeMaterial: THREE.Material,
	);
}
