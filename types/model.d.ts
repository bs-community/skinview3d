import * as THREE from "three";

export class SkinObject extends THREE.Group {
	readonly head: THREE.Group;
	readonly body: THREE.Group;
	readonly rightArm: THREE.Group;
	readonly leftArm: THREE.Group;
	readonly rightLeg: THREE.Group;
	readonly leftLeg: THREE.Group;

	constructor(
		isSlim: boolean,
		layer1Material: THREE.Material,
		layer2Material: THREE.Material,
	);
}

export class CapeObject extends THREE.Group {
	readonly cape: THREE.Mesh;

	constructor(capeMaterial: THREE.Material);
}

export class PlayerObject extends THREE.Group {
	readonly slim: boolean;
	readonly skin: SkinObject;
	readonly cape: CapeObject;

	constructor(
		isSlim: boolean,
		layer1Material: THREE.Material,
		layer2Material: THREE.Material,
		capeMaterial: THREE.Material,
	);
}
