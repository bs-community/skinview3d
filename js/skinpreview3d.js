/*
 * skinpreview3d.js
 * https://github.com/yushijinhun/skinpreview3d.js
 */

'use strict';

(function($) {
	$.fn.skinPreview3D = function (options) {
		var sp = new SkinPreview3D(this, options.width, options.height, options.slim === true);
		sp.setSkin(options.skinUrl);
		if(options.capeUrl != null)
			sp.setCape(options.capeUrl);
	};

} (window.jQuery));

function SkinPreview3D(model, canvasW, canvasH, isSlim){
	var radius = 32;
	var isPaused = false;
	var originMouseX = 0;
	var rotating = false;
	var modelRot = 0;
	var angleRot = 0;
	var mouseDown = false;

	var camera = new THREE.PerspectiveCamera(75, canvasW / canvasH, 1, 10000);
	camera.position.y = -12;

	var scene = new THREE.Scene();

	var skinCanvas = document.createElement('canvas');
	skinCanvas.width = 64;
	skinCanvas.height = 64;
	var skinContext = skinCanvas.getContext("2d");
	var skinTexture = new THREE.Texture(skinCanvas);
	skinTexture.magFilter = THREE.NearestFilter;
	skinTexture.minFilter = THREE.NearestMipMapNearestFilter;

	var capeCanvas = document.createElement('canvas');
	capeCanvas.width = 32;
	capeCanvas.height = 32;
	var capeContext = capeCanvas.getContext("2d");
	var capeTexture = new THREE.Texture(capeCanvas);
	capeTexture.magFilter = THREE.NearestFilter;
	capeTexture.minFilter = THREE.NearestMipMapNearestFilter;

	var layer1Material = new THREE.MeshBasicMaterial({map: skinTexture, side: THREE.FrontSide});
	var layer2Material = new THREE.MeshBasicMaterial({map: skinTexture, transparent: true, opacity: 1, side: THREE.DoubleSide});
	var capeMaterial = new THREE.MeshBasicMaterial({map: capeTexture});

	var skinImg = new Image();
	skinImg.crossOrigin = '';
	var hasAnimate = false;
	skinImg.onload = () => {
		skinContext.clearRect(0, 0, 64, 64);
		skinContext.drawImage(skinImg, 0, 0);

		skinTexture.needsUpdate = true;
		layer1Material.needsUpdate = true;
		layer2Material.needsUpdate = true;

		if(!hasAnimate) {
			initializeSkin();
			hasAnimate = true;
			drawSkin();
		}
	};
	skinImg.onerror = () => console.log("Failed loading " + skinImg.src);

	var capeImg = new Image();
	capeImg.crossOrigin = '';
	capeImg.onload = () => {
		capePivot.add(capeMesh);

		capeContext.clearRect(0, 0, capeCanvas.width, capeCanvas.height);
		capeContext.drawImage(capeImg, 0, 0, capeCanvas.width, capeCanvas.height);

		capeTexture.needsUpdate = true;
		capeMaterial.needsUpdate = true;
	};
	capeImg.onerror = () => console.log("Failed loading " + capeImg.src);

	this.setSkin = url => skinImg.src = url;
	this.setCape = url => capeImg.src = url;

	var renderer;
	var capePivot;
	var headBox, headMesh, bodyBox, bodyMesh, rightArmBox, rightArmMesh, leftArmBox, leftArmMesh, rightLegBox, rightLegMesh, leftLegBox, leftLegMesh, head2Box, head2Mesh, body2Box, body2Mesh, rightArm2Box, rightArm2Mesh, leftArm2Box, leftArm2Mesh, rightLeg2Box, rightLeg2Mesh, leftLeg2Box, leftLeg2Mesh, capeBox, capeMesh;

	var initializeSkin = () => {
		var toFaceVertices = (x1,y1,x2,y2,w,h) => [
			new THREE.Vector2(x1/w, 1.0-y2/h),
			new THREE.Vector2(x2/w, 1.0-y2/h),
			new THREE.Vector2(x2/w, 1.0-y1/h),
			new THREE.Vector2(x1/w, 1.0-y1/h)
		];
		var toSkinVertices = (x1,y1,x2,y2) => toFaceVertices(x1, y1, x2, y2, 64.0, 64.0);
		var toCapeVertices = (x1,y1,x2,y2) => toFaceVertices(x1, y1, x2, y2, 22.0, 17.0);
		var addVertices = (box,top,bottom,left,front,right,back) => {
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
		};

		// Head Parts
		headBox = new THREE.BoxGeometry(8, 8, 8, 0, 0, 0);
		addVertices(headBox,
			toSkinVertices(8, 0, 16, 8),
			toSkinVertices(16, 0, 24, 8),
			toSkinVertices(0, 8, 8, 16),
			toSkinVertices(8, 8, 16, 16),
			toSkinVertices(16, 8, 24, 16),
			toSkinVertices(24, 8, 32, 16)
		);
		headMesh = new THREE.Mesh(headBox, layer1Material);
		headMesh.name = "head";
		scene.add(headMesh);

		// Body Parts
		bodyBox = new THREE.BoxGeometry(8, 12, 4, 0, 0, 0);
		addVertices(bodyBox,
			toSkinVertices(20, 16, 28, 20),
			toSkinVertices(28, 16, 36, 20),
			toSkinVertices(16, 20, 20, 32),
			toSkinVertices(20, 20, 28, 32),
			toSkinVertices(28, 20, 32, 32),
			toSkinVertices(32, 20, 40, 32)
		);
		bodyMesh = new THREE.Mesh(bodyBox, layer1Material);
		bodyMesh.name = "body";
		bodyMesh.position.y = -10;
		scene.add(bodyMesh);

		// Right Arm Parts
		rightArmBox = new THREE.BoxGeometry(isSlim?3:4, 12, 4, 0, 0, 0);
		if (isSlim) {
			addVertices(rightArmBox,
				toSkinVertices(44, 16, 47, 20),
				toSkinVertices(47, 16, 50, 20),
				toSkinVertices(40, 20, 44, 32),
				toSkinVertices(44, 20, 47, 32),
				toSkinVertices(47, 20, 51, 32),
				toSkinVertices(51, 20, 54, 32)
			);
		} else {
			addVertices(rightArmBox,
				toSkinVertices(44, 16, 48, 20),
				toSkinVertices(48, 16, 52, 20),
				toSkinVertices(40, 20, 44, 32),
				toSkinVertices(44, 20, 48, 32),
				toSkinVertices(48, 20, 52, 32),
				toSkinVertices(52, 20, 56, 32)
			);
		}
		rightArmMesh = new THREE.Mesh(rightArmBox, layer1Material);
		rightArmMesh.name = "rightArm";
		rightArmMesh.position.y = -10;
		rightArmMesh.position.x = isSlim?-5.5:-6;
		scene.add(rightArmMesh);

		// Left Arm Parts
		leftArmBox = new THREE.BoxGeometry(isSlim?3:4, 12, 4, 0, 0, 0);
		if (isSlim) {
			addVertices(leftArmBox,
				toSkinVertices(36, 48, 39, 52),
				toSkinVertices(39, 48, 42, 52),
				toSkinVertices(32, 52, 36, 64),
				toSkinVertices(36, 52, 39, 64),
				toSkinVertices(39, 52, 43, 64),
				toSkinVertices(43, 52, 46, 64)
			);
		} else {
			addVertices(leftArmBox,
				toSkinVertices(36, 48, 40, 52),
				toSkinVertices(40, 48, 44, 52),
				toSkinVertices(32, 52, 36, 64),
				toSkinVertices(36, 52, 40, 64),
				toSkinVertices(40, 52, 44, 64),
				toSkinVertices(44, 52, 48, 64)
			);
		}
		leftArmMesh = new THREE.Mesh(leftArmBox, layer1Material);
		leftArmMesh.name = "leftArm";
		leftArmMesh.position.y = -10;
		leftArmMesh.position.x = isSlim?5.5:6;
		scene.add(leftArmMesh);

		// Right Leg Parts
		rightLegBox = new THREE.BoxGeometry(4, 12, 4, 0, 0, 0);
		addVertices(rightLegBox,
			toSkinVertices(4, 16, 8, 20),
			toSkinVertices(8, 16, 12, 20),
			toSkinVertices(0, 20, 4, 32),
			toSkinVertices(4, 20, 8, 32),
			toSkinVertices(8, 20, 12, 32),
			toSkinVertices(12, 20, 16, 32)
		);
		rightLegMesh = new THREE.Mesh(rightLegBox, layer1Material);
		rightLegMesh.name = "rightLeg"
		rightLegMesh.position.y = -22;
		rightLegMesh.position.x = -2;
		scene.add(rightLegMesh);

		// Left Leg Parts
		leftLegBox = new THREE.BoxGeometry(4, 12, 4, 0, 0, 0);
		addVertices(leftLegBox,
			toSkinVertices(20, 48, 24, 52),
			toSkinVertices(24, 48, 28, 52),
			toSkinVertices(16, 52, 20, 64),
			toSkinVertices(20, 52, 24, 64),
			toSkinVertices(24, 52, 28, 64),
			toSkinVertices(28, 52, 32, 64)
		);
		leftLegMesh = new THREE.Mesh(leftLegBox, layer1Material);
		leftLegMesh.name = "leftLeg";
		leftLegMesh.position.y = -22;
		leftLegMesh.position.x = 2;
		scene.add(leftLegMesh);

		// Head Overlay Parts
		head2Box = new THREE.BoxGeometry(9, 9, 9, 0, 0, 0);
		addVertices(head2Box,
			toSkinVertices(40, 0, 48, 8),
			toSkinVertices(48, 0, 56, 8),
			toSkinVertices(32, 8, 40, 16),
			toSkinVertices(40, 8, 48, 16),
			toSkinVertices(48, 8, 56, 16),
			toSkinVertices(56, 8, 64, 16)
		);
		head2Mesh = new THREE.Mesh(head2Box, layer2Material);
		head2Mesh.name = "head2"
		scene.add(head2Mesh);

		// Body Overlay Parts
		body2Box = new THREE.BoxGeometry(9, 13.5, 4.5, 0, 0, 0);
		addVertices(body2Box,
			toSkinVertices(20, 32, 28, 36),
			toSkinVertices(28, 32, 36, 36),
			toSkinVertices(16, 36, 20, 48),
			toSkinVertices(20, 36, 28, 48),
			toSkinVertices(28, 36, 32, 48),
			toSkinVertices(32, 36, 40, 48)
		);
		body2Mesh = new THREE.Mesh(body2Box, layer2Material);
		body2Mesh.name = "body2";
		body2Mesh.position.y = -10;
		scene.add(body2Mesh);

		// Right Arm Overlay Parts
		rightArm2Box = new THREE.BoxGeometry(isSlim?3.375:4.5, 13.5, 4.5, 0, 0, 0);
		if (isSlim) {
			addVertices(rightArm2Box,
				toSkinVertices(44, 32, 47, 36),
				toSkinVertices(47, 32, 50, 36),
				toSkinVertices(40, 36, 44, 48),
				toSkinVertices(44, 36, 47, 48),
				toSkinVertices(47, 36, 51, 48),
				toSkinVertices(51, 36, 54, 48)
			);
		} else {
			addVertices(rightArm2Box,
				toSkinVertices(44, 32, 48, 36),
				toSkinVertices(48, 32, 52, 36),
				toSkinVertices(40, 36, 44, 48),
				toSkinVertices(44, 36, 48, 48),
				toSkinVertices(48, 36, 52, 48),
				toSkinVertices(52, 36, 56, 48)
			);
		}
		rightArm2Mesh = new THREE.Mesh(rightArm2Box, layer2Material);
		rightArm2Mesh.name = "rightArm2";
		rightArm2Mesh.position.y = -10;
		rightArm2Mesh.position.x = -6;
		scene.add(rightArm2Mesh);

		// Left Arm Overlay Parts
		leftArm2Box = new THREE.BoxGeometry(isSlim?3.375:4.5, 13.5, 4.5, 0, 0, 0);
		if (isSlim) {
			addVertices(leftArm2Box,
				toSkinVertices(52, 48, 55, 52),
				toSkinVertices(55, 48, 58, 52),
				toSkinVertices(48, 52, 52, 64),
				toSkinVertices(52, 52, 55, 64),
				toSkinVertices(55, 52, 59, 64),
				toSkinVertices(59, 52, 62, 64)
			);
		} else {
			addVertices(leftArm2Box,
				toSkinVertices(52, 48, 56, 52),
				toSkinVertices(56, 48, 60, 52),
				toSkinVertices(48, 52, 52, 64),
				toSkinVertices(52, 52, 56, 64),
				toSkinVertices(56, 52, 60, 64),
				toSkinVertices(60, 52, 64, 64)
			);
		}
		leftArm2Mesh = new THREE.Mesh(leftArm2Box, layer2Material);
		leftArm2Mesh.name = "leftArm2";
		leftArm2Mesh.position.y = -10;
		leftArm2Mesh.position.x = 6;
		// leftArm2Mesh.visible = true;
		scene.add(leftArm2Mesh);

		// Right Leg Overlay Parts
		rightLeg2Box = new THREE.BoxGeometry(4.5, 13.5, 4.5, 0, 0, 0);
		addVertices(rightLeg2Box,
			toSkinVertices(4, 32, 8, 36),
			toSkinVertices(8, 32, 12, 36),
			toSkinVertices(0, 36, 4, 48),
			toSkinVertices(4, 36, 8, 48),
			toSkinVertices(8, 36, 12, 48),
			toSkinVertices(12, 36, 16, 48)
		);
		rightLeg2Mesh = new THREE.Mesh(rightLeg2Box, layer2Material);
		rightLeg2Mesh.name = "rightLeg2"
		rightLeg2Mesh.position.y = -22;
		rightLeg2Mesh.position.x = -2;
		scene.add(rightLeg2Mesh);

		// Left Leg Overlay Parts
		leftLeg2Box = new THREE.BoxGeometry(4.5, 13.5, 4.5, 0, 0, 0);
		addVertices(leftLeg2Box,
			toSkinVertices(4, 48, 8, 52),
			toSkinVertices(8, 48, 12, 52),
			toSkinVertices(0, 52, 4, 64),
			toSkinVertices(4, 52, 8, 64),
			toSkinVertices(8, 52, 12, 64),
			toSkinVertices(12, 52, 16, 64)
		);
		leftLeg2Mesh = new THREE.Mesh(leftLeg2Box, layer2Material);
		leftLeg2Mesh.name = "leftLeg2";
		leftLeg2Mesh.position.y = -22;
		leftLeg2Mesh.position.x = 2;
		scene.add(leftLeg2Mesh);

		// Cape Parts
		// back = outside
		// front = inside
		capeBox = new THREE.BoxGeometry(10, 16, 1, 0, 0, 0);
		addVertices(capeBox,
			toCapeVertices(1, 0, 11, 0),
			toCapeVertices(11, 0, 21, 0),
			toCapeVertices(11, 1, 11, 17),
			toCapeVertices(12, 1, 22, 17),
			toCapeVertices(0, 1, 0, 17),
			toCapeVertices(1, 1, 11, 17)
		);
		capeMesh = new THREE.Mesh(capeBox, capeMaterial);
		capeMesh.name = "cape";
		capeMesh.position.y = -12.75;
		capeMesh.position.z = -0.55;
		capePivot = new THREE.Group();
		capePivot.rotation.x = 25 * (Math.PI/180);
		scene.add(capePivot);

		renderer = new THREE.WebGLRenderer({angleRot: true, alpha: true, antialias: false});
		renderer.setSize(canvasW, canvasH);
		renderer.context.getShaderInfoLog = () => ''; // shut firefox up

		model.append(renderer.domElement);
	}

	var startTime = Date.now();
	var drawSkin = () => {
		requestAnimationFrame(drawSkin);
		var time = (Date.now() - startTime)/1000;
		if(!mouseDown && !isPaused){
			modelRot += 0.5;
			angleRot += 0.01;
		}

		var ang = -(modelRot * Math.PI / 180);

		camera.rotation.y = ang;
		camera.position.z = radius*Math.cos(ang);
		camera.position.x = radius*Math.sin(ang);

		var speed = 3;
		//Leg Swing
		leftLeg2Mesh.rotation.x = leftLegMesh.rotation.x = Math.cos(angleRot*speed);
		leftLeg2Mesh.position.z = leftLegMesh.position.z = 0 - 6*Math.sin(leftLegMesh.rotation.x);
		leftLeg2Mesh.position.y = leftLegMesh.position.y = -16 - 6*Math.abs(Math.cos(leftLegMesh.rotation.x));
		rightLeg2Mesh.rotation.x = rightLegMesh.rotation.x = Math.cos(angleRot*speed + (Math.PI));
		rightLeg2Mesh.position.z = rightLegMesh.position.z = 0 - 6*Math.sin(rightLegMesh.rotation.x);
		rightLeg2Mesh.position.y = rightLegMesh.position.y = -16 - 6*Math.abs(Math.cos(rightLegMesh.rotation.x));

		//Arm Swing
		leftArm2Mesh.rotation.x = leftArmMesh.rotation.x = Math.cos(angleRot*speed + (Math.PI));
		leftArm2Mesh.position.z = leftArmMesh.position.z = 0 - 6*Math.sin(leftArmMesh.rotation.x);
		leftArm2Mesh.position.y = leftArmMesh.position.y = -4 - 6*Math.abs(Math.cos(leftArmMesh.rotation.x));
		rightArm2Mesh.rotation.x = rightArmMesh.rotation.x = Math.cos(angleRot*speed);
		rightArm2Mesh.position.z = rightArmMesh.position.z = 0 - 6*Math.sin(rightArmMesh.rotation.x);
		rightArm2Mesh.position.y = rightArmMesh.position.y = -4 - 6*Math.abs(Math.cos(rightArmMesh.rotation.x));

		renderer.render(scene, camera);

		if(angleRot > 360)
			angleRot = 0;
	}

	model.mousedown(function(e){
		originMouseX = (e.pageX - this.offsetLeft) - modelRot;
		mouseDown = true;
	});

	window.jQuery(document).mouseup(() => mouseDown = false);

	model.bind("contextmenu", e => {
		e.preventDefault();
		isPaused = !isPaused;
	});

	model.mousemove(function(e){
		if(!mouseDown) return;
		var x = (e.pageX - this.offsetLeft) - originMouseX;
		modelRot = x;
	});
}
