/*
 * skinpreview3d.js
 * https://github.com/Hacksore/skinpreview3d.js
 */

'use strict';

// namespace skinpreview3d
var skinpreview3d = new function(){

	var copyImage = (context, sX, sY, w, h, dX, dY, flipHorizontal) => {
		var imgData = context.getImageData(sX, sY, w, h);
		if(flipHorizontal){
			for(var y = 0; y < h; y++) {
				for(var x = 0; x < (w / 2); x++) {
					var index = (x + y * w) * 4;
					var index2 = ((w - x - 1) + y * w) * 4;
					var pA1 = imgData.data[index];
					var pA2 = imgData.data[index+1];
					var pA3 = imgData.data[index+2];
					var pA4 = imgData.data[index+3];

					var pB1 = imgData.data[index2];
					var pB2 = imgData.data[index2+1];
					var pB3 = imgData.data[index2+2];
					var pB4 = imgData.data[index2+3];

					imgData.data[index] = pB1;
					imgData.data[index+1] = pB2;
					imgData.data[index+2] = pB3;
					imgData.data[index+3] = pB4;

					imgData.data[index2] = pA1;
					imgData.data[index2+1] = pA2;
					imgData.data[index2+2] = pA3;
					imgData.data[index2+3] = pA4;
				}
			}
		}
		context.putImageData(imgData,dX,dY);
	};

	var convertSkinTo1_8 = (context, width) => {
		var scale = width/64.0;
		var copySkin = (context, sX, sY, w, h, dX, dY, flipHorizontal) => copyImage(context, sX*scale, sY*scale, w*scale, h*scale, dX*scale, dY*scale, flipHorizontal);

		copySkin(context, 4, 16, 4, 4, 20, 48, true); // Top Leg
		copySkin(context, 8, 16, 4, 4, 24, 48, true); // Bottom Leg
		copySkin(context, 0, 20, 4, 12, 24, 52, true); // Outer Leg
		copySkin(context, 4, 20, 4, 12, 20, 52, true); // Front Leg
		copySkin(context, 8, 20, 4, 12, 16, 52, true); // Inner Leg
		copySkin(context, 12, 20, 4, 12, 28, 52, true); // Back Leg
		copySkin(context, 44, 16, 4, 4, 36, 48, true); // Top Arm
		copySkin(context, 48, 16, 4, 4, 40, 48, true); // Bottom Arm
		copySkin(context, 40, 20, 4, 12, 40, 52, true); // Outer Arm
		copySkin(context, 44, 20, 4, 12, 36, 52, true); // Front Arm
		copySkin(context, 48, 20, 4, 12, 32, 52, true); // Inner Arm
		copySkin(context, 52, 20, 4, 12, 44, 52, true); // Back Arm
	};

	var toFaceVertices = (x1,y1,x2,y2,w,h) => [
		new THREE.Vector2(x1/w, 1.0-y2/h),
		new THREE.Vector2(x2/w, 1.0-y2/h),
		new THREE.Vector2(x2/w, 1.0-y1/h),
		new THREE.Vector2(x1/w, 1.0-y1/h)
	];

	var toSkinVertices = (x1,y1,x2,y2) => toFaceVertices(x1, y1, x2, y2, 64.0, 64.0);
	var toCapeVertices = (x1,y1,x2,y2) => toFaceVertices(x1, y1, x2, y2, 64.0, 32.0);

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

	this.SkinViewer = function(domElement, canvasW, canvasH, isSlim){
		var angleRot = 0;
		var initialized = false;

		var skinImg = new Image();
		var skinCanvas = document.createElement('canvas');
		var skinContext = skinCanvas.getContext('2d');
		var skinTexture = new THREE.Texture(skinCanvas);
		skinTexture.magFilter = THREE.NearestFilter;
		skinTexture.minFilter = THREE.NearestMipMapNearestFilter;

		var capeImg = new Image();
		var capeCanvas = document.createElement('canvas');
		var capeContext = capeCanvas.getContext('2d');
		var capeTexture = new THREE.Texture(capeCanvas);
		capeTexture.magFilter = THREE.NearestFilter;
		capeTexture.minFilter = THREE.NearestMipMapNearestFilter;

		var layer1Material = new THREE.MeshBasicMaterial({map: skinTexture, side: THREE.FrontSide});
		var layer2Material = new THREE.MeshBasicMaterial({map: skinTexture, transparent: true, opacity: 1, side: THREE.DoubleSide});
		var capeMaterial = new THREE.MeshBasicMaterial({map: capeTexture});

		var capePivot;

		var headBox, headMesh,
			bodyBox, bodyMesh,
			rightArmBox, rightArmMesh,
			leftArmBox, leftArmMesh,
			rightLegBox, rightLegMesh,
			leftLegBox, leftLegMesh,
			head2Box, head2Mesh,
			body2Box, body2Mesh,
			rightArm2Box, rightArm2Mesh,
			leftArm2Box, leftArm2Mesh,
			rightLeg2Box, rightLeg2Mesh,
			leftLeg2Box, leftLeg2Mesh,
			capeBox, capeMesh;

		this.domElement = domElement;
		this.animationPaused = false;
		this.animationSpeed = 3;

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(75, canvasW / canvasH, 1, 10000);
		this.camera.position.y = -12;
		this.camera.position.z = 30;

		this.renderer = new THREE.WebGLRenderer({angleRot: true, alpha: true, antialias: false});
		this.renderer.setSize(canvasW, canvasH);
		this.renderer.context.getShaderInfoLog = () => ''; // shut firefox up

		Object.defineProperties(this, {
			'skinUrl': {
				get: () => skinImg.src,
				set: url => skinImg.src = url
			},
			'capeUrl': {
				get: () => capeImg.src,
				set: url => capeImg.src = url
			}
		});

		var initialize = () => {
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
			headMesh.name = 'head';
			this.scene.add(headMesh);

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
			bodyMesh.name = 'body';
			bodyMesh.position.y = -10;
			this.scene.add(bodyMesh);

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
			rightArmMesh.name = 'rightArm';
			rightArmMesh.position.y = -10;
			rightArmMesh.position.x = isSlim?-5.5:-6;
			this.scene.add(rightArmMesh);

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
			leftArmMesh.name = 'leftArm';
			leftArmMesh.position.y = -10;
			leftArmMesh.position.x = isSlim?5.5:6;
			this.scene.add(leftArmMesh);

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
			rightLegMesh.name = 'rightLeg'
			rightLegMesh.position.y = -22;
			rightLegMesh.position.x = -2;
			this.scene.add(rightLegMesh);

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
			leftLegMesh.name = 'leftLeg';
			leftLegMesh.position.y = -22;
			leftLegMesh.position.x = 2;
			this.scene.add(leftLegMesh);

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
			head2Mesh.name = 'head2'
			this.scene.add(head2Mesh);

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
			body2Mesh.name = 'body2';
			body2Mesh.position.y = -10;
			this.scene.add(body2Mesh);

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
			rightArm2Mesh.name = 'rightArm2';
			rightArm2Mesh.position.y = -10;
			rightArm2Mesh.position.x = -6;
			this.scene.add(rightArm2Mesh);

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
			leftArm2Mesh.name = 'leftArm2';
			leftArm2Mesh.position.y = -10;
			leftArm2Mesh.position.x = 6;
			// leftArm2Mesh.visible = true;
			this.scene.add(leftArm2Mesh);

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
			rightLeg2Mesh.name = 'rightLeg2'
			rightLeg2Mesh.position.y = -22;
			rightLeg2Mesh.position.x = -2;
			this.scene.add(rightLeg2Mesh);

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
			leftLeg2Mesh.name = 'leftLeg2';
			leftLeg2Mesh.position.y = -22;
			leftLeg2Mesh.position.x = 2;
			this.scene.add(leftLeg2Mesh);

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
			capeMesh.name = 'cape';
			capeMesh.position.y = -12.75;
			capeMesh.position.z = -0.55;
			capePivot = new THREE.Group();
			capePivot.rotation.x = 25 * (Math.PI/180);
			this.scene.add(capePivot);

			this.domElement.append(this.renderer.domElement);
		}

		skinImg.crossOrigin = '';
		skinImg.onload = () => {
			var isOldFormat = false;
			if (skinImg.width !== skinImg.height) {
				if (skinImg.width === 2*skinImg.height) {
					isOldFormat = true;
				} else {
					console.log('Bad skin size');
					return;
				}
			}

			if(isOldFormat){
				var width = skinImg.width;
				skinCanvas.width = width;
				skinCanvas.height = width;
				skinContext.clearRect(0, 0, width, width);
				skinContext.drawImage(skinImg, 0, 0, width, width/2.0);
				convertSkinTo1_8(skinContext, width);
			} else {
				skinCanvas.width = skinImg.width;
				skinCanvas.height = skinImg.height;
				skinContext.clearRect(0, 0, skinCanvas.width, skinCanvas.height);
				skinContext.drawImage(skinImg, 0, 0, skinCanvas.width, skinCanvas.height);
			}

			skinTexture.needsUpdate = true;
			layer1Material.needsUpdate = true;
			layer2Material.needsUpdate = true;

			if(!initialized) {
				initialize();
				initialized = true;
				drawSkin();
			}
		};
		skinImg.onerror = () => console.log('Failed loading ' + skinImg.src);

		capeImg.crossOrigin = '';
		capeImg.onload = () => {
			if (capeImg.width !== 2*capeImg.height) {
				console.log('Bad cape size');
				return;
			}

			capePivot.add(capeMesh);

			capeCanvas.width = capeImg.width;
			capeCanvas.height = capeImg.height;
			capeContext.clearRect(0, 0, capeCanvas.width, capeCanvas.height);
			capeContext.drawImage(capeImg, 0, 0, capeCanvas.width, capeCanvas.height);

			capeTexture.needsUpdate = true;
			capeMaterial.needsUpdate = true;
		};
		capeImg.onerror = () => console.log('Failed loading ' + capeImg.src);

		var startTime = Date.now();
		var drawSkin = () => {
			requestAnimationFrame(drawSkin);
			var time = (Date.now() - startTime)/1000;
			if(!this.animationPaused)
				angleRot += 0.01;

			//Leg Swing
			leftLeg2Mesh.rotation.x = leftLegMesh.rotation.x = Math.cos(angleRot*this.animationSpeed);
			leftLeg2Mesh.position.z = leftLegMesh.position.z = 0 - 6*Math.sin(leftLegMesh.rotation.x);
			leftLeg2Mesh.position.y = leftLegMesh.position.y = -16 - 6*Math.abs(Math.cos(leftLegMesh.rotation.x));
			rightLeg2Mesh.rotation.x = rightLegMesh.rotation.x = Math.cos(angleRot*this.animationSpeed + (Math.PI));
			rightLeg2Mesh.position.z = rightLegMesh.position.z = 0 - 6*Math.sin(rightLegMesh.rotation.x);
			rightLeg2Mesh.position.y = rightLegMesh.position.y = -16 - 6*Math.abs(Math.cos(rightLegMesh.rotation.x));

			//Arm Swing
			leftArm2Mesh.rotation.x = leftArmMesh.rotation.x = Math.cos(angleRot*this.animationSpeed + (Math.PI));
			leftArm2Mesh.position.z = leftArmMesh.position.z = 0 - 6*Math.sin(leftArmMesh.rotation.x);
			leftArm2Mesh.position.y = leftArmMesh.position.y = -4 - 6*Math.abs(Math.cos(leftArmMesh.rotation.x));
			rightArm2Mesh.rotation.x = rightArmMesh.rotation.x = Math.cos(angleRot*this.animationSpeed);
			rightArm2Mesh.position.z = rightArmMesh.position.z = 0 - 6*Math.sin(rightArmMesh.rotation.x);
			rightArm2Mesh.position.y = rightArmMesh.position.y = -4 - 6*Math.abs(Math.cos(rightArmMesh.rotation.x));

			this.renderer.render(this.scene, this.camera);

			if(angleRot > 360)
				angleRot = 0;
		}
	}

	// ====== OrbitControls ======
	// The code was originally from https://github.com/mrdoob/three.js/blob/d45a042cf962e9b1aa9441810ba118647b48aacb/examples/js/controls/OrbitControls.js
	/**
	 * The MIT License
	 *
	 * Copyright © 2010-2017 three.js authors
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	*/
	this.OrbitControls = function (object, domElement) {
		/**
		 * @author qiao / https://github.com/qiao
		 * @author mrdoob / http://mrdoob.com
		 * @author alteredq / http://alteredqualia.com/
		 * @author WestLangley / http://github.com/WestLangley
		 * @author erich666 / http://erichaines.com
		 */
		// This set of controls performs orbiting, dollying (zooming), and panning.
		// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
		//
		//    Orbit - left mouse / touch: one finger move
		//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
		//    Pan - right mouse, or arrow keys / touch: three finger swipe

		this.object = object;

		this.domElement = (domElement !== undefined) ? domElement : document;

		// Set to false to disable this control
		this.enabled = true;

		// "target" sets the location of focus, where the object orbits around
		this.target = new THREE.Vector3();

		// How far you can dolly in and out (PerspectiveCamera only)
		this.minDistance = 0;
		this.maxDistance = Infinity;

		// How far you can zoom in and out (OrthographicCamera only)
		this.minZoom = 0;
		this.maxZoom = Infinity;

		// How far you can orbit vertically, upper and lower limits.
		// Range is 0 to Math.PI radians.
		this.minPolarAngle = 0; // radians
		this.maxPolarAngle = Math.PI; // radians

		// How far you can orbit horizontally, upper and lower limits.
		// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
		this.minAzimuthAngle = - Infinity; // radians
		this.maxAzimuthAngle = Infinity; // radians

		// Set to true to enable damping (inertia)
		// If damping is enabled, you must call controls.update() in your animation loop
		this.enableDamping = false;
		this.dampingFactor = 0.25;

		// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
		// Set to false to disable zooming
		this.enableZoom = true;
		this.zoomSpeed = 1.0;

		// Set to false to disable rotating
		this.enableRotate = true;
		this.rotateSpeed = 1.0;

		// Set to false to disable panning
		this.enablePan = true;
		this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

		// Set to true to automatically rotate around the target
		// If auto-rotate is enabled, you must call controls.update() in your animation loop
		this.autoRotate = false;
		this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

		// Set to false to disable use of the keys
		this.enableKeys = true;

		// The four arrow keys
		this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

		// Mouse buttons
		this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

		// for reset
		this.target0 = this.target.clone();
		this.position0 = this.object.position.clone();
		this.zoom0 = this.object.zoom;

		//
		// public methods
		//

		this.getPolarAngle = function () {
			return spherical.phi;
		};

		this.getAzimuthalAngle = function () {
			return spherical.theta;
		};

		this.saveState = function () {
			scope.target0.copy(scope.target);
			scope.position0.copy(scope.object.position);
			scope.zoom0 = scope.object.zoom;
		};

		this.reset = function () {
			scope.target.copy(scope.target0);
			scope.object.position.copy(scope.position0);
			scope.object.zoom = scope.zoom0;

			scope.object.updateProjectionMatrix();
			scope.dispatchEvent(changeEvent);

			scope.update();

			state = STATE.NONE;
		};

		// this method is exposed, but perhaps it would be better if we can make it private...
		this.update = function () {
			var offset = new THREE.Vector3();

			// so camera.up is the orbit axis
			var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
			var quatInverse = quat.clone().inverse();

			var lastPosition = new THREE.Vector3();
			var lastQuaternion = new THREE.Quaternion();

			return function update() {

				var position = scope.object.position;

				offset.copy(position).sub(scope.target);

				// rotate offset to "y-axis-is-up" space
				offset.applyQuaternion(quat);

				// angle from z-axis around y-axis
				spherical.setFromVector3(offset);

				if (scope.autoRotate && state === STATE.NONE) {

					rotateLeft(getAutoRotationAngle());

				}

				spherical.theta += sphericalDelta.theta;
				spherical.phi += sphericalDelta.phi;

				// restrict theta to be between desired limits
				spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta));

				// restrict phi to be between desired limits
				spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));

				spherical.makeSafe();

				spherical.radius *= scale;

				// restrict radius to be between desired limits
				spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));

				// move target to panned location
				scope.target.add(panOffset);

				offset.setFromSpherical(spherical);

				// rotate offset back to "camera-up-vector-is-up" space
				offset.applyQuaternion(quatInverse);

				position.copy(scope.target).add(offset);

				scope.object.lookAt(scope.target);

				if (scope.enableDamping === true) {

					sphericalDelta.theta *= (1 - scope.dampingFactor);
					sphericalDelta.phi *= (1 - scope.dampingFactor);

				} else {

					sphericalDelta.set(0, 0, 0);

				}

				scale = 1;
				panOffset.set(0, 0, 0);

				// update condition is:
				// min(camera displacement, camera rotation in radians)^2 > EPS
				// using small-angle approximation cos(x/2) = 1 - x^2 / 8

				if (zoomChanged ||
					lastPosition.distanceToSquared(scope.object.position) > EPS ||
					8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {

					scope.dispatchEvent(changeEvent);

					lastPosition.copy(scope.object.position);
					lastQuaternion.copy(scope.object.quaternion);
					zoomChanged = false;

					return true;
				}
				return false;
			};
		}();

		this.dispose = function () {
			scope.domElement.removeEventListener('contextmenu', onContextMenu, false);
			scope.domElement.removeEventListener('mousedown', onMouseDown, false);
			scope.domElement.removeEventListener('wheel', onMouseWheel, false);

			scope.domElement.removeEventListener('touchstart', onTouchStart, false);
			scope.domElement.removeEventListener('touchend', onTouchEnd, false);
			scope.domElement.removeEventListener('touchmove', onTouchMove, false);

			document.removeEventListener('mousemove', onMouseMove, false);
			document.removeEventListener('mouseup', onMouseUp, false);

			window.removeEventListener('keydown', onKeyDown, false);

			//scope.dispatchEvent({ type: 'dispose' }); // should this be added here?
		};

		//
		// internals
		//

		var scope = this;

		var changeEvent = { type: 'change' };
		var startEvent = { type: 'start' };
		var endEvent = { type: 'end' };

		var STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };

		var state = STATE.NONE;

		var EPS = 0.000001;

		// current position in spherical coordinates
		var spherical = new THREE.Spherical();
		var sphericalDelta = new THREE.Spherical();

		var scale = 1;
		var panOffset = new THREE.Vector3();
		var zoomChanged = false;

		var rotateStart = new THREE.Vector2();
		var rotateEnd = new THREE.Vector2();
		var rotateDelta = new THREE.Vector2();

		var panStart = new THREE.Vector2();
		var panEnd = new THREE.Vector2();
		var panDelta = new THREE.Vector2();

		var dollyStart = new THREE.Vector2();
		var dollyEnd = new THREE.Vector2();
		var dollyDelta = new THREE.Vector2();

		function getAutoRotationAngle() {
			return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
		}

		function getZoomScale() {
			return Math.pow(0.95, scope.zoomSpeed);
		}

		function rotateLeft(angle) {
			sphericalDelta.theta -= angle;
		}

		function rotateUp(angle) {
			sphericalDelta.phi -= angle;
		}

		var panLeft = function () {
			var v = new THREE.Vector3();
			return function panLeft(distance, objectMatrix) {
				v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
				v.multiplyScalar(- distance);

				panOffset.add(v);
			};
		}();

		var panUp = function () {
			var v = new THREE.Vector3();
			return function panUp(distance, objectMatrix) {
				v.setFromMatrixColumn(objectMatrix, 1); // get Y column of objectMatrix
				v.multiplyScalar(distance);

				panOffset.add(v);
			};
		}();

		// deltaX and deltaY are in pixels; right and down are positive
		var pan = function () {
			var offset = new THREE.Vector3();
			return function pan(deltaX, deltaY) {
				var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
				if (scope.object instanceof THREE.PerspectiveCamera) {
					// perspective
					var position = scope.object.position;
					offset.copy(position).sub(scope.target);
					var targetDistance = offset.length();

					// half of the fov is center to top of screen
					targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);

					// we actually don't use screenWidth, since perspective camera is fixed to screen height
					panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
					panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
				} else if (scope.object instanceof THREE.OrthographicCamera) {
					// orthographic
					panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
					panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);
				} else {
					// camera neither orthographic nor perspective
					console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
					scope.enablePan = false;
				}
			};
		}();

		function dollyIn(dollyScale) {
			if (scope.object instanceof THREE.PerspectiveCamera) {
				scale /= dollyScale;
			} else if (scope.object instanceof THREE.OrthographicCamera) {
				scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
				scope.object.updateProjectionMatrix();
				zoomChanged = true;
			} else {
				console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
				scope.enableZoom = false;
			}
		}

		function dollyOut(dollyScale) {
			if (scope.object instanceof THREE.PerspectiveCamera) {
				scale *= dollyScale;
			} else if (scope.object instanceof THREE.OrthographicCamera) {
				scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
				scope.object.updateProjectionMatrix();
				zoomChanged = true;
			} else {
				console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
				scope.enableZoom = false;
			}
		}

		//
		// event callbacks - update the object state
		//

		function handleMouseDownRotate(event) {
			rotateStart.set(event.clientX, event.clientY);

		}

		function handleMouseDownDolly(event) {
			dollyStart.set(event.clientX, event.clientY);

		}

		function handleMouseDownPan(event) {
			panStart.set(event.clientX, event.clientY);

		}

		function handleMouseMoveRotate(event) {
			rotateEnd.set(event.clientX, event.clientY);
			rotateDelta.subVectors(rotateEnd, rotateStart);
			var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
			// rotating across whole screen goes 360 degrees around
			rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
			// rotating up and down along whole screen attempts to go 360, but limited to 180
			rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
			rotateStart.copy(rotateEnd);
			scope.update();
		}

		function handleMouseMoveDolly(event) {
			dollyEnd.set(event.clientX, event.clientY);
			dollyDelta.subVectors(dollyEnd, dollyStart);
			if (dollyDelta.y > 0) {
				dollyIn(getZoomScale());
			} else if (dollyDelta.y < 0) {
				dollyOut(getZoomScale());
			}
			dollyStart.copy(dollyEnd);
			scope.update();
		}

		function handleMouseMovePan(event) {
			panEnd.set(event.clientX, event.clientY);
			panDelta.subVectors(panEnd, panStart);
			pan(panDelta.x, panDelta.y);
			panStart.copy(panEnd);
			scope.update();
		}

		function handleMouseUp(event) {
		}

		function handleMouseWheel(event) {
			if (event.deltaY < 0) {
				dollyOut(getZoomScale());
			} else if (event.deltaY > 0) {
				dollyIn(getZoomScale());
			}
			scope.update();
		}

		function handleKeyDown(event) {
			switch (event.keyCode) {
				case scope.keys.UP:
					pan(0, scope.keyPanSpeed);
					scope.update();
					break;

				case scope.keys.BOTTOM:
					pan(0, - scope.keyPanSpeed);
					scope.update();
					break;

				case scope.keys.LEFT:
					pan(scope.keyPanSpeed, 0);
					scope.update();
					break;

				case scope.keys.RIGHT:
					pan(- scope.keyPanSpeed, 0);
					scope.update();
					break;
			}

		}

		function handleTouchStartRotate(event) {
			rotateStart.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);

		}

		function handleTouchStartDolly(event) {
			var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
			var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
			var distance = Math.sqrt(dx * dx + dy * dy);
			dollyStart.set(0, distance);
		}

		function handleTouchStartPan(event) {
			panStart.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
		}

		function handleTouchMoveRotate(event) {
			rotateEnd.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
			rotateDelta.subVectors(rotateEnd, rotateStart);
			var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
			rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
			rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
			rotateStart.copy(rotateEnd);
			scope.update();

		}

		function handleTouchMoveDolly(event) {
			var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
			var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
			var distance = Math.sqrt(dx * dx + dy * dy);
			dollyEnd.set(0, distance);
			dollyDelta.subVectors(dollyEnd, dollyStart);
			if (dollyDelta.y > 0) {
				dollyOut(getZoomScale());
			} else if (dollyDelta.y < 0) {
				dollyIn(getZoomScale());
			}
			dollyStart.copy(dollyEnd);
			scope.update();

		}

		function handleTouchMovePan(event) {
			panEnd.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
			panDelta.subVectors(panEnd, panStart);
			pan(panDelta.x, panDelta.y);
			panStart.copy(panEnd);
			scope.update();
		}

		function handleTouchEnd(event) {
		}

		//
		// event handlers - FSM: listen for events and reset state
		//

		function onMouseDown(event) {
			if (scope.enabled === false) return;
			switch (event.button) {
				case scope.mouseButtons.ORBIT:
					if (scope.enableRotate === false) return;
					handleMouseDownRotate(event);
					state = STATE.ROTATE;
					break;

				case scope.mouseButtons.ZOOM:
					if (scope.enableZoom === false) return;
					handleMouseDownDolly(event);
					state = STATE.DOLLY;
					break;

				case scope.mouseButtons.PAN:
					if (scope.enablePan === false) return;
					handleMouseDownPan(event);
					state = STATE.PAN;
					break;
			}

			event.preventDefault();
			if (state !== STATE.NONE) {
				document.addEventListener('mousemove', onMouseMove, false);
				document.addEventListener('mouseup', onMouseUp, false);
				scope.dispatchEvent(startEvent);
			}
		}

		function onMouseMove(event) {
			if (scope.enabled === false) return;
			switch (state) {
				case STATE.ROTATE:
					if (scope.enableRotate === false) return;
					handleMouseMoveRotate(event);
					break;

				case STATE.DOLLY:
					if (scope.enableZoom === false) return;
					handleMouseMoveDolly(event);
					break;

				case STATE.PAN:
					if (scope.enablePan === false) return;
					handleMouseMovePan(event);
					break;
			}
			event.preventDefault();
		}

		function onMouseUp(event) {
			if (scope.enabled === false) return;
			handleMouseUp(event);
			document.removeEventListener('mousemove', onMouseMove, false);
			document.removeEventListener('mouseup', onMouseUp, false);
			scope.dispatchEvent(endEvent);
			state = STATE.NONE;
		}

		function onMouseWheel(event) {
			if (scope.enabled === false || scope.enableZoom === false || (state !== STATE.NONE && state !== STATE.ROTATE)) return;
			event.preventDefault();
			event.stopPropagation();
			handleMouseWheel(event);
			scope.dispatchEvent(startEvent); // not sure why these are here...
			scope.dispatchEvent(endEvent);
		}

		function onKeyDown(event) {
			if (scope.enabled === false || scope.enableKeys === false || scope.enablePan === false) return;
			handleKeyDown(event);
		}

		function onTouchStart(event) {
			if (scope.enabled === false) return;
			switch (event.touches.length) {
				case 1:	// one-fingered touch: rotate
					if (scope.enableRotate === false) return;
					handleTouchStartRotate(event);
					state = STATE.TOUCH_ROTATE;
					break;

				case 2:	// two-fingered touch: dolly
					if (scope.enableZoom === false) return;
					handleTouchStartDolly(event);
					state = STATE.TOUCH_DOLLY;
					break;

				case 3: // three-fingered touch: pan
					if (scope.enablePan === false) return;
					handleTouchStartPan(event);
					state = STATE.TOUCH_PAN;
					break;

				default:
					state = STATE.NONE;
			}

			if (state !== STATE.NONE) {
				scope.dispatchEvent(startEvent);
			}

		}

		function onTouchMove(event) {
			if (scope.enabled === false) return;
			switch (event.touches.length) {
				case 1: // one-fingered touch: rotate
					if (scope.enableRotate === false) return;
					if (state !== STATE.TOUCH_ROTATE) return; // is this needed?...
					handleTouchMoveRotate(event);
					break;

				case 2: // two-fingered touch: dolly
					if (scope.enableZoom === false) return;
					if (state !== STATE.TOUCH_DOLLY) return; // is this needed?...
					handleTouchMoveDolly(event);
					break;

				case 3: // three-fingered touch: pan
					if (scope.enablePan === false) return;
					if (state !== STATE.TOUCH_PAN) return; // is this needed?...
					handleTouchMovePan(event);
					break;

				default:
					state = STATE.NONE;
			}
			event.preventDefault();
			event.stopPropagation();
		}

		function onTouchEnd(event) {
			if (scope.enabled === false) return;
			handleTouchEnd(event);
			scope.dispatchEvent(endEvent);
			state = STATE.NONE;
		}

		function onContextMenu(event) {
			if (scope.enabled === false || scope.enablePan === false) return;
			event.preventDefault();
		}

		//

		scope.domElement.addEventListener('contextmenu', onContextMenu, false);

		scope.domElement.addEventListener('mousedown', onMouseDown, false);
		scope.domElement.addEventListener('wheel', onMouseWheel, false);

		scope.domElement.addEventListener('touchstart', onTouchStart, false);
		scope.domElement.addEventListener('touchend', onTouchEnd, false);
		scope.domElement.addEventListener('touchmove', onTouchMove, false);

		window.addEventListener('keydown', onKeyDown, false);

		// force an update at start

		this.update();
	};

	this.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
	this.OrbitControls.prototype.constructor = this.OrbitControls;
	// ============

	this.SkinControl = function(skinViewer) {
		this.enableAnimationControl = true;
		this.skinViewer = skinViewer;

		this.orbitControls = new skinpreview3d.OrbitControls(skinViewer.camera, skinViewer.renderer.domElement);
		this.orbitControls.enablePan = false;
		this.orbitControls.target = new THREE.Vector3(0, -12 ,0);
		this.orbitControls.minDistance = 10;
		this.orbitControls.maxDistance = 256;
		this.orbitControls.update();

		this.skinViewer.domElement.addEventListener('contextmenu', e => {
			if(this.enableAnimationControl) {
				e.preventDefault();
				this.skinViewer.animationPaused = !this.skinViewer.animationPaused;
			}
		}, false);
	}

}

if(window.jQuery){
	(function($) {
		$.fn.skinPreview3d = function (options) {
			var skinViewer = new skinpreview3d.SkinViewer(this.get(0), options.width, options.height, options.slim === true);
			skinViewer.skinUrl = options.skinUrl;
			if(options.capeUrl != null)
				skinViewer.capeUrl = options.capeUrl;

			if(options.disableControl !== true)
				skinViewer.control = new skinpreview3d.SkinControl(skinViewer);
		};
	} (window.jQuery));
}
