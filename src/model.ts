import { BoxGeometry, DoubleSide, FrontSide, Group, Mesh, MeshBasicMaterial, Object3D, Texture, Vector2 } from "three";

function toFaceVertices(x1: number, y1: number, x2: number, y2: number, w: number, h: number): Array<Vector2> {
	return [
		new Vector2(x1 / w, 1.0 - y2 / h),
		new Vector2(x2 / w, 1.0 - y2 / h),
		new Vector2(x2 / w, 1.0 - y1 / h),
		new Vector2(x1 / w, 1.0 - y1 / h)
	];
}

function toSkinVertices(x1: number, y1: number, x2: number, y2: number): Array<Vector2> {
	return toFaceVertices(x1, y1, x2, y2, 64.0, 64.0);
}

function toCapeVertices(x1: number, y1: number, x2: number, y2: number): Array<Vector2> {
	return toFaceVertices(x1, y1, x2, y2, 64.0, 32.0);
}

function setVertices(box: BoxGeometry, top: Array<Vector2>, bottom: Array<Vector2>, left: Array<Vector2>, front: Array<Vector2>, right: Array<Vector2>, back: Array<Vector2>): void {

	box.faceVertexUvs[0] = [];
	box.faceVertexUvs[0][0] = [right[3], right[0], right[2]];
	box.faceVertexUvs[0][1] = [right[0], right[1], right[2]];
	box.faceVertexUvs[0][2] = [left[3], left[0], left[2]];
	box.faceVertexUvs[0][3] = [left[0], left[1], left[2]];
	box.faceVertexUvs[0][4] = [top[3], top[0], top[2]];
	box.faceVertexUvs[0][5] = [top[0], top[1], top[2]];
	box.faceVertexUvs[0][6] = [bottom[0], bottom[3], bottom[1]];
	box.faceVertexUvs[0][7] = [bottom[3], bottom[2], bottom[1]];
	box.faceVertexUvs[0][8] = [front[3], front[0], front[2]];
	box.faceVertexUvs[0][9] = [front[0], front[1], front[2]];
	box.faceVertexUvs[0][10] = [back[3], back[0], back[2]];
	box.faceVertexUvs[0][11] = [back[0], back[1], back[2]];
}

/**
 * Notice that innerLayer and outerLayer may NOT be the direct children of the Group.
 */
export class BodyPart extends Group {
	constructor(
		readonly innerLayer: Object3D,
		readonly outerLayer: Object3D
	) {
		super();
		innerLayer.name = "inner";
		outerLayer.name = "outer";
	}
}

export class SkinObject extends Group {

	// body parts
	readonly head: BodyPart;
	readonly body: BodyPart;
	readonly rightArm: BodyPart;
	readonly leftArm: BodyPart;
	readonly rightLeg: BodyPart;
	readonly leftLeg: BodyPart;

	private modelListeners: Array<() => void> = []; // called when model(slim property) is changed
	private _slim = false;

	constructor(texture: Texture) {
		super();

		const layer1 = {
			map: texture,
			side: FrontSide
		};
		const layer2 = {
			map: texture,
			side: DoubleSide,
			transparent: true,
			opacity: 1,
			alphaTest: 0.5
		}

		const layer1Material = new MeshBasicMaterial(layer1);
		const layer2Material = new MeshBasicMaterial(layer2);

		// Head
		const headBox = new BoxGeometry(8, 8, 8, 0, 0, 0);
		setVertices(headBox,
			toSkinVertices(8, 0, 16, 8),
			toSkinVertices(16, 0, 24, 8),
			toSkinVertices(0, 8, 8, 16),
			toSkinVertices(8, 8, 16, 16),
			toSkinVertices(16, 8, 24, 16),
			toSkinVertices(24, 8, 32, 16)
		);
		const headMesh = new Mesh(headBox, layer1Material);

		const head2Box = new BoxGeometry(9, 9, 9, 0, 0, 0);
		setVertices(head2Box,
			toSkinVertices(40, 0, 48, 8),
			toSkinVertices(48, 0, 56, 8),
			toSkinVertices(32, 8, 40, 16),
			toSkinVertices(40, 8, 48, 16),
			toSkinVertices(48, 8, 56, 16),
			toSkinVertices(56, 8, 64, 16)
		);
		const head2Mesh = new Mesh(head2Box, layer2Material);
		head2Mesh.renderOrder = -1;

		this.head = new BodyPart(headMesh, head2Mesh);
		this.head.name = "head";
		this.head.add(headMesh, head2Mesh);
		this.add(this.head);

		// Body
		const bodyBox = new BoxGeometry(8, 12, 4, 0, 0, 0);
		setVertices(bodyBox,
			toSkinVertices(20, 16, 28, 20),
			toSkinVertices(28, 16, 36, 20),
			toSkinVertices(16, 20, 20, 32),
			toSkinVertices(20, 20, 28, 32),
			toSkinVertices(28, 20, 32, 32),
			toSkinVertices(32, 20, 40, 32)
		);
		const bodyMesh = new Mesh(bodyBox, new MeshBasicMaterial({
			...layer1,
			// this pulls bodyMesh towards the camera
			// so body is given priority over others in z-fighting
			polygonOffset: true,
			polygonOffsetUnits: -1
		}));

		const body2Box = new BoxGeometry(9, 13.5, 4.5, 0, 0, 0);
		setVertices(body2Box,
			toSkinVertices(20, 32, 28, 36),
			toSkinVertices(28, 32, 36, 36),
			toSkinVertices(16, 36, 20, 48),
			toSkinVertices(20, 36, 28, 48),
			toSkinVertices(28, 36, 32, 48),
			toSkinVertices(32, 36, 40, 48)
		);
		const body2Mesh = new Mesh(body2Box, new MeshBasicMaterial({
			...layer2,
			// same as above
			polygonOffset: true,
			polygonOffsetUnits: -1
		}));

		this.body = new BodyPart(bodyMesh, body2Mesh);
		this.body.name = "body";
		this.body.add(bodyMesh, body2Mesh);
		this.body.position.y = -10;
		this.add(this.body);

		// Right Arm
		const rightArmBox = new BoxGeometry(1, 1, 1, 0, 0, 0); // w/d/h is model-related
		const rightArmMesh = new Mesh(rightArmBox, layer1Material);
		this.modelListeners.push(() => {
			rightArmMesh.scale.x = this.slim ? 3 : 4;
			rightArmMesh.scale.y = 12;
			rightArmMesh.scale.z = 4;
			if (this.slim) {
				setVertices(rightArmBox,
					toSkinVertices(44, 16, 47, 20),
					toSkinVertices(47, 16, 50, 20),
					toSkinVertices(40, 20, 44, 32),
					toSkinVertices(44, 20, 47, 32),
					toSkinVertices(47, 20, 51, 32),
					toSkinVertices(51, 20, 54, 32)
				);
			} else {
				setVertices(rightArmBox,
					toSkinVertices(44, 16, 48, 20),
					toSkinVertices(48, 16, 52, 20),
					toSkinVertices(40, 20, 44, 32),
					toSkinVertices(44, 20, 48, 32),
					toSkinVertices(48, 20, 52, 32),
					toSkinVertices(52, 20, 56, 32)
				);
			}
			rightArmBox.uvsNeedUpdate = true;
			rightArmBox.elementsNeedUpdate = true;
		});

		const rightArm2Box = new BoxGeometry(1, 1, 1, 0, 0, 0); // w/d/h is model-related
		const rightArm2Mesh = new Mesh(rightArm2Box, layer2Material);
		rightArm2Mesh.renderOrder = 1;
		this.modelListeners.push(() => {
			rightArm2Mesh.scale.x = this.slim ? 3.375 : 4.5;
			rightArm2Mesh.scale.y = 13.5;
			rightArm2Mesh.scale.z = 4.5;
			if (this.slim) {
				setVertices(rightArm2Box,
					toSkinVertices(44, 32, 47, 36),
					toSkinVertices(47, 32, 50, 36),
					toSkinVertices(40, 36, 44, 48),
					toSkinVertices(44, 36, 47, 48),
					toSkinVertices(47, 36, 51, 48),
					toSkinVertices(51, 36, 54, 48)
				);
			} else {
				setVertices(rightArm2Box,
					toSkinVertices(44, 32, 48, 36),
					toSkinVertices(48, 32, 52, 36),
					toSkinVertices(40, 36, 44, 48),
					toSkinVertices(44, 36, 48, 48),
					toSkinVertices(48, 36, 52, 48),
					toSkinVertices(52, 36, 56, 48)
				);
			}
			rightArm2Box.uvsNeedUpdate = true;
			rightArm2Box.elementsNeedUpdate = true;
		});

		const rightArmPivot = new Group();
		rightArmPivot.add(rightArmMesh, rightArm2Mesh);
		rightArmPivot.position.y = -4;

		this.rightArm = new BodyPart(rightArmMesh, rightArm2Mesh);
		this.rightArm.name = "rightArm";
		this.rightArm.add(rightArmPivot);
		this.rightArm.position.y = -6;
		this.modelListeners.push(() => {
			this.rightArm.position.x = this.slim ? -5.5 : -6;
		});
		this.add(this.rightArm);

		// Left Arm
		const leftArmBox = new BoxGeometry(1, 1, 1, 0, 0, 0); // w/d/h is model-related
		const leftArmMesh = new Mesh(leftArmBox, layer1Material);
		this.modelListeners.push(() => {
			leftArmMesh.scale.x = this.slim ? 3 : 4;
			leftArmMesh.scale.y = 12;
			leftArmMesh.scale.z = 4;
			if (this.slim) {
				setVertices(leftArmBox,
					toSkinVertices(36, 48, 39, 52),
					toSkinVertices(39, 48, 42, 52),
					toSkinVertices(32, 52, 36, 64),
					toSkinVertices(36, 52, 39, 64),
					toSkinVertices(39, 52, 43, 64),
					toSkinVertices(43, 52, 46, 64)
				);
			} else {
				setVertices(leftArmBox,
					toSkinVertices(36, 48, 40, 52),
					toSkinVertices(40, 48, 44, 52),
					toSkinVertices(32, 52, 36, 64),
					toSkinVertices(36, 52, 40, 64),
					toSkinVertices(40, 52, 44, 64),
					toSkinVertices(44, 52, 48, 64)
				);
			}
			leftArmBox.uvsNeedUpdate = true;
			leftArmBox.elementsNeedUpdate = true;
		});

		const leftArm2Box = new BoxGeometry(1, 1, 1, 0, 0, 0); // w/d/h is model-related
		const leftArm2Mesh = new Mesh(leftArm2Box, layer2Material);
		leftArm2Mesh.renderOrder = 1;
		this.modelListeners.push(() => {
			leftArm2Mesh.scale.x = this.slim ? 3.375 : 4.5;
			leftArm2Mesh.scale.y = 13.5;
			leftArm2Mesh.scale.z = 4.5;
			if (this.slim) {
				setVertices(leftArm2Box,
					toSkinVertices(52, 48, 55, 52),
					toSkinVertices(55, 48, 58, 52),
					toSkinVertices(48, 52, 52, 64),
					toSkinVertices(52, 52, 55, 64),
					toSkinVertices(55, 52, 59, 64),
					toSkinVertices(59, 52, 62, 64)
				);
			} else {
				setVertices(leftArm2Box,
					toSkinVertices(52, 48, 56, 52),
					toSkinVertices(56, 48, 60, 52),
					toSkinVertices(48, 52, 52, 64),
					toSkinVertices(52, 52, 56, 64),
					toSkinVertices(56, 52, 60, 64),
					toSkinVertices(60, 52, 64, 64)
				);
			}
			leftArm2Box.uvsNeedUpdate = true;
			leftArm2Box.elementsNeedUpdate = true;
		});

		const leftArmPivot = new Group();
		leftArmPivot.add(leftArmMesh, leftArm2Mesh);
		leftArmPivot.position.y = -4;

		this.leftArm = new BodyPart(leftArmMesh, leftArm2Mesh);
		this.leftArm.name = "leftArm";
		this.leftArm.add(leftArmPivot);
		this.leftArm.position.y = -6;
		this.modelListeners.push(() => {
			this.leftArm.position.x = this.slim ? 5.5 : 6;
		});
		this.add(this.leftArm);

		// Right Leg
		const rightLegBox = new BoxGeometry(4, 12, 4, 0, 0, 0);
		setVertices(rightLegBox,
			toSkinVertices(4, 16, 8, 20),
			toSkinVertices(8, 16, 12, 20),
			toSkinVertices(0, 20, 4, 32),
			toSkinVertices(4, 20, 8, 32),
			toSkinVertices(8, 20, 12, 32),
			toSkinVertices(12, 20, 16, 32)
		);
		const rightLegMesh = new Mesh(rightLegBox, layer1Material);

		const rightLeg2Box = new BoxGeometry(4.5, 13.5, 4.5, 0, 0, 0);
		setVertices(rightLeg2Box,
			toSkinVertices(4, 32, 8, 36),
			toSkinVertices(8, 32, 12, 36),
			toSkinVertices(0, 36, 4, 48),
			toSkinVertices(4, 36, 8, 48),
			toSkinVertices(8, 36, 12, 48),
			toSkinVertices(12, 36, 16, 48)
		);
		const rightLeg2Mesh = new Mesh(rightLeg2Box, layer2Material);
		rightLeg2Mesh.renderOrder = 1;

		const rightLegPivot = new Group();
		rightLegPivot.add(rightLegMesh, rightLeg2Mesh);
		rightLegPivot.position.y = -6;

		this.rightLeg = new BodyPart(rightLegMesh, rightLeg2Mesh);
		this.rightLeg.name = "rightLeg";
		this.rightLeg.add(rightLegPivot);
		this.rightLeg.position.y = -16;
		this.rightLeg.position.x = -2;
		this.add(this.rightLeg);

		// Left Leg
		const leftLegBox = new BoxGeometry(4, 12, 4, 0, 0, 0);
		setVertices(leftLegBox,
			toSkinVertices(20, 48, 24, 52),
			toSkinVertices(24, 48, 28, 52),
			toSkinVertices(16, 52, 20, 64),
			toSkinVertices(20, 52, 24, 64),
			toSkinVertices(24, 52, 28, 64),
			toSkinVertices(28, 52, 32, 64)
		);
		const leftLegMesh = new Mesh(leftLegBox, layer1Material);

		const leftLeg2Box = new BoxGeometry(4.5, 13.5, 4.5, 0, 0, 0);
		setVertices(leftLeg2Box,
			toSkinVertices(4, 48, 8, 52),
			toSkinVertices(8, 48, 12, 52),
			toSkinVertices(0, 52, 4, 64),
			toSkinVertices(4, 52, 8, 64),
			toSkinVertices(8, 52, 12, 64),
			toSkinVertices(12, 52, 16, 64)
		);
		const leftLeg2Mesh = new Mesh(leftLeg2Box, layer2Material);
		leftLeg2Mesh.renderOrder = 1;

		const leftLegPivot = new Group();
		leftLegPivot.add(leftLegMesh, leftLeg2Mesh);
		leftLegPivot.position.y = -6;

		this.leftLeg = new BodyPart(leftLegMesh, leftLeg2Mesh);
		this.leftLeg.name = "leftLeg";
		this.leftLeg.add(leftLegPivot);
		this.leftLeg.position.y = -16;
		this.leftLeg.position.x = 2;
		this.add(this.leftLeg);

		this.slim = false;
	}

	get slim(): boolean {
		return this._slim;
	}

	set slim(value) {
		this._slim = value;
		this.modelListeners.forEach(listener => listener());
	}

	private getBodyParts(): Array<BodyPart> {
		return this.children.filter(it => it instanceof BodyPart) as Array<BodyPart>;
	}

	setInnerLayerVisible(value: boolean): void {
		this.getBodyParts().forEach(part => part.innerLayer.visible = value);
	}

	setOuterLayerVisible(value: boolean): void {
		this.getBodyParts().forEach(part => part.outerLayer.visible = value);
	}
}

export class CapeObject extends Group {

	readonly cape: Mesh;

	constructor(texture: Texture) {
		super();

		const capeMaterial = new MeshBasicMaterial({ map: texture, transparent: true, opacity: 1, side: DoubleSide, alphaTest: 0.5 });

		// back = outside
		// front = inside
		const capeBox = new BoxGeometry(10, 16, 1, 0, 0, 0);
		setVertices(capeBox,
			toCapeVertices(1, 0, 11, 1),
			toCapeVertices(11, 0, 21, 1),
			toCapeVertices(11, 1, 12, 17),
			toCapeVertices(12, 1, 22, 17),
			toCapeVertices(0, 1, 1, 17),
			toCapeVertices(1, 1, 11, 17)
		);
		this.cape = new Mesh(capeBox, capeMaterial);
		this.cape.position.y = -8;
		this.cape.position.z = -0.5;
		this.add(this.cape);
	}
}

export class PlayerObject extends Group {

	readonly skin: SkinObject;
	readonly cape: CapeObject;

	constructor(skinTexture: Texture, capeTexture: Texture) {
		super();

		this.skin = new SkinObject(skinTexture);
		this.skin.name = "skin";
		this.add(this.skin);

		this.cape = new CapeObject(capeTexture);
		this.cape.name = "cape";
		this.cape.position.z = -2;
		this.cape.position.y = -4;
		this.cape.rotation.x = 25 * Math.PI / 180;
		this.add(this.cape);
	}
}
