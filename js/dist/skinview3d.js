/**
 * skinview3d (https://github.com/bs-community/skinview3d)
 *
 * MIT License
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three')) :
	typeof define === 'function' && define.amd ? define(['exports', 'three'], factory) :
	(global = global || self, factory(global.skinview3d = {}, global.THREE));
}(this, (function (exports, three) { 'use strict';

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */
	/* global Reflect, Promise */

	var extendStatics = function(d, b) {
	    extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return extendStatics(d, b);
	};

	function __extends(d, b) {
	    extendStatics(d, b);
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	}

	function toFaceVertices(x1, y1, x2, y2, w, h) {
	    return [
	        new three.Vector2(x1 / w, 1.0 - y2 / h),
	        new three.Vector2(x2 / w, 1.0 - y2 / h),
	        new three.Vector2(x2 / w, 1.0 - y1 / h),
	        new three.Vector2(x1 / w, 1.0 - y1 / h)
	    ];
	}
	function toSkinVertices(x1, y1, x2, y2) {
	    return toFaceVertices(x1, y1, x2, y2, 64.0, 64.0);
	}
	function toCapeVertices(x1, y1, x2, y2) {
	    return toFaceVertices(x1, y1, x2, y2, 64.0, 32.0);
	}
	function setVertices(box, top, bottom, left, front, right, back) {
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
	var esp = 0.002;
	/**
	 * Notice that innerLayer and outerLayer may NOT be the direct children of the Group.
	 */
	var BodyPart = /** @class */ (function (_super) {
	    __extends(BodyPart, _super);
	    function BodyPart(innerLayer, outerLayer) {
	        var _this = _super.call(this) || this;
	        _this.innerLayer = innerLayer;
	        _this.outerLayer = outerLayer;
	        innerLayer.name = "inner";
	        outerLayer.name = "outer";
	        return _this;
	    }
	    return BodyPart;
	}(three.Group));
	var SkinObject = /** @class */ (function (_super) {
	    __extends(SkinObject, _super);
	    function SkinObject(layer1Material, layer2Material) {
	        var _this = _super.call(this) || this;
	        _this.modelListeners = []; // called when model(slim property) is changed
	        _this._slim = false;
	        // Head
	        var headBox = new three.BoxGeometry(8, 8, 8, 0, 0, 0);
	        setVertices(headBox, toSkinVertices(8, 0, 16, 8), toSkinVertices(16, 0, 24, 8), toSkinVertices(0, 8, 8, 16), toSkinVertices(8, 8, 16, 16), toSkinVertices(16, 8, 24, 16), toSkinVertices(24, 8, 32, 16));
	        var headMesh = new three.Mesh(headBox, layer1Material);
	        var head2Box = new three.BoxGeometry(9, 9, 9, 0, 0, 0);
	        setVertices(head2Box, toSkinVertices(40, 0, 48, 8), toSkinVertices(48, 0, 56, 8), toSkinVertices(32, 8, 40, 16), toSkinVertices(40, 8, 48, 16), toSkinVertices(48, 8, 56, 16), toSkinVertices(56, 8, 64, 16));
	        var head2Mesh = new three.Mesh(head2Box, layer2Material);
	        head2Mesh.renderOrder = -1;
	        _this.head = new BodyPart(headMesh, head2Mesh);
	        _this.head.name = "head";
	        _this.head.add(headMesh, head2Mesh);
	        _this.add(_this.head);
	        // Body
	        var bodyBox = new three.BoxGeometry(8, 12, 4, 0, 0, 0);
	        setVertices(bodyBox, toSkinVertices(20, 16, 28, 20), toSkinVertices(28, 16, 36, 20), toSkinVertices(16, 20, 20, 32), toSkinVertices(20, 20, 28, 32), toSkinVertices(28, 20, 32, 32), toSkinVertices(32, 20, 40, 32));
	        var bodyMesh = new three.Mesh(bodyBox, layer1Material);
	        var body2Box = new three.BoxGeometry(9, 13.5, 4.5, 0, 0, 0);
	        setVertices(body2Box, toSkinVertices(20, 32, 28, 36), toSkinVertices(28, 32, 36, 36), toSkinVertices(16, 36, 20, 48), toSkinVertices(20, 36, 28, 48), toSkinVertices(28, 36, 32, 48), toSkinVertices(32, 36, 40, 48));
	        var body2Mesh = new three.Mesh(body2Box, layer2Material);
	        _this.body = new BodyPart(bodyMesh, body2Mesh);
	        _this.body.name = "body";
	        _this.body.add(bodyMesh, body2Mesh);
	        _this.body.position.y = -10;
	        _this.add(_this.body);
	        // Right Arm
	        var rightArmBox = new three.BoxGeometry(1, 1, 1, 0, 0, 0); // w/d/h is model-related
	        var rightArmMesh = new three.Mesh(rightArmBox, layer1Material);
	        _this.modelListeners.push(function () {
	            rightArmMesh.scale.x = (_this.slim ? 3 : 4) - esp;
	            rightArmMesh.scale.y = 12 - esp;
	            rightArmMesh.scale.z = 4 - esp;
	            if (_this.slim) {
	                setVertices(rightArmBox, toSkinVertices(44, 16, 47, 20), toSkinVertices(47, 16, 50, 20), toSkinVertices(40, 20, 44, 32), toSkinVertices(44, 20, 47, 32), toSkinVertices(47, 20, 51, 32), toSkinVertices(51, 20, 54, 32));
	            }
	            else {
	                setVertices(rightArmBox, toSkinVertices(44, 16, 48, 20), toSkinVertices(48, 16, 52, 20), toSkinVertices(40, 20, 44, 32), toSkinVertices(44, 20, 48, 32), toSkinVertices(48, 20, 52, 32), toSkinVertices(52, 20, 56, 32));
	            }
	            rightArmBox.uvsNeedUpdate = true;
	            rightArmBox.elementsNeedUpdate = true;
	        });
	        var rightArm2Box = new three.BoxGeometry(1, 1, 1, 0, 0, 0); // w/d/h is model-related
	        var rightArm2Mesh = new three.Mesh(rightArm2Box, layer2Material);
	        rightArm2Mesh.renderOrder = 1;
	        _this.modelListeners.push(function () {
	            rightArm2Mesh.scale.x = (_this.slim ? 3.375 : 4.5) - esp;
	            rightArm2Mesh.scale.y = 13.5 - esp;
	            rightArm2Mesh.scale.z = 4.5 - esp;
	            if (_this.slim) {
	                setVertices(rightArm2Box, toSkinVertices(44, 32, 47, 36), toSkinVertices(47, 32, 50, 36), toSkinVertices(40, 36, 44, 48), toSkinVertices(44, 36, 47, 48), toSkinVertices(47, 36, 51, 48), toSkinVertices(51, 36, 54, 48));
	            }
	            else {
	                setVertices(rightArm2Box, toSkinVertices(44, 32, 48, 36), toSkinVertices(48, 32, 52, 36), toSkinVertices(40, 36, 44, 48), toSkinVertices(44, 36, 48, 48), toSkinVertices(48, 36, 52, 48), toSkinVertices(52, 36, 56, 48));
	            }
	            rightArm2Box.uvsNeedUpdate = true;
	            rightArm2Box.elementsNeedUpdate = true;
	        });
	        var rightArmPivot = new three.Group();
	        rightArmPivot.add(rightArmMesh, rightArm2Mesh);
	        rightArmPivot.position.y = -6;
	        _this.rightArm = new BodyPart(rightArmMesh, rightArm2Mesh);
	        _this.rightArm.name = "rightArm";
	        _this.rightArm.add(rightArmPivot);
	        _this.rightArm.position.y = -4;
	        _this.modelListeners.push(function () {
	            _this.rightArm.position.x = _this.slim ? -5.5 : -6;
	        });
	        _this.add(_this.rightArm);
	        // Left Arm
	        var leftArmBox = new three.BoxGeometry(1, 1, 1, 0, 0, 0); // w/d/h is model-related
	        var leftArmMesh = new three.Mesh(leftArmBox, layer1Material);
	        _this.modelListeners.push(function () {
	            leftArmMesh.scale.x = (_this.slim ? 3 : 4) - esp;
	            leftArmMesh.scale.y = 12 - esp;
	            leftArmMesh.scale.z = 4 - esp;
	            if (_this.slim) {
	                setVertices(leftArmBox, toSkinVertices(36, 48, 39, 52), toSkinVertices(39, 48, 42, 52), toSkinVertices(32, 52, 36, 64), toSkinVertices(36, 52, 39, 64), toSkinVertices(39, 52, 43, 64), toSkinVertices(43, 52, 46, 64));
	            }
	            else {
	                setVertices(leftArmBox, toSkinVertices(36, 48, 40, 52), toSkinVertices(40, 48, 44, 52), toSkinVertices(32, 52, 36, 64), toSkinVertices(36, 52, 40, 64), toSkinVertices(40, 52, 44, 64), toSkinVertices(44, 52, 48, 64));
	            }
	            leftArmBox.uvsNeedUpdate = true;
	            leftArmBox.elementsNeedUpdate = true;
	        });
	        var leftArm2Box = new three.BoxGeometry(1, 1, 1, 0, 0, 0); // w/d/h is model-related
	        var leftArm2Mesh = new three.Mesh(leftArm2Box, layer2Material);
	        leftArm2Mesh.renderOrder = 1;
	        _this.modelListeners.push(function () {
	            leftArm2Mesh.scale.x = (_this.slim ? 3.375 : 4.5) - esp;
	            leftArm2Mesh.scale.y = 13.5 - esp;
	            leftArm2Mesh.scale.z = 4.5 - esp;
	            if (_this.slim) {
	                setVertices(leftArm2Box, toSkinVertices(52, 48, 55, 52), toSkinVertices(55, 48, 58, 52), toSkinVertices(48, 52, 52, 64), toSkinVertices(52, 52, 55, 64), toSkinVertices(55, 52, 59, 64), toSkinVertices(59, 52, 62, 64));
	            }
	            else {
	                setVertices(leftArm2Box, toSkinVertices(52, 48, 56, 52), toSkinVertices(56, 48, 60, 52), toSkinVertices(48, 52, 52, 64), toSkinVertices(52, 52, 56, 64), toSkinVertices(56, 52, 60, 64), toSkinVertices(60, 52, 64, 64));
	            }
	            leftArm2Box.uvsNeedUpdate = true;
	            leftArm2Box.elementsNeedUpdate = true;
	        });
	        var leftArmPivot = new three.Group();
	        leftArmPivot.add(leftArmMesh, leftArm2Mesh);
	        leftArmPivot.position.y = -6;
	        _this.leftArm = new BodyPart(leftArmMesh, leftArm2Mesh);
	        _this.leftArm.name = "leftArm";
	        _this.leftArm.add(leftArmPivot);
	        _this.leftArm.position.y = -4;
	        _this.modelListeners.push(function () {
	            _this.leftArm.position.x = _this.slim ? 5.5 : 6;
	        });
	        _this.add(_this.leftArm);
	        // Right Leg
	        var rightLegBox = new three.BoxGeometry(4 - esp, 12 - esp, 4 - esp, 0, 0, 0);
	        setVertices(rightLegBox, toSkinVertices(4, 16, 8, 20), toSkinVertices(8, 16, 12, 20), toSkinVertices(0, 20, 4, 32), toSkinVertices(4, 20, 8, 32), toSkinVertices(8, 20, 12, 32), toSkinVertices(12, 20, 16, 32));
	        var rightLegMesh = new three.Mesh(rightLegBox, layer1Material);
	        var rightLeg2Box = new three.BoxGeometry(4.5 - esp, 13.5 - esp, 4.5 - esp, 0, 0, 0);
	        setVertices(rightLeg2Box, toSkinVertices(4, 32, 8, 36), toSkinVertices(8, 32, 12, 36), toSkinVertices(0, 36, 4, 48), toSkinVertices(4, 36, 8, 48), toSkinVertices(8, 36, 12, 48), toSkinVertices(12, 36, 16, 48));
	        var rightLeg2Mesh = new three.Mesh(rightLeg2Box, layer2Material);
	        rightLeg2Mesh.renderOrder = 1;
	        var rightLegPivot = new three.Group();
	        rightLegPivot.add(rightLegMesh, rightLeg2Mesh);
	        rightLegPivot.position.y = -6;
	        _this.rightLeg = new BodyPart(rightLegMesh, rightLeg2Mesh);
	        _this.rightLeg.name = "rightLeg";
	        _this.rightLeg.add(rightLegPivot);
	        _this.rightLeg.position.y = -16;
	        _this.rightLeg.position.x = -2;
	        _this.add(_this.rightLeg);
	        // Left Leg
	        var leftLegBox = new three.BoxGeometry(4 - esp, 12 - esp, 4 - esp, 0, 0, 0);
	        setVertices(leftLegBox, toSkinVertices(20, 48, 24, 52), toSkinVertices(24, 48, 28, 52), toSkinVertices(16, 52, 20, 64), toSkinVertices(20, 52, 24, 64), toSkinVertices(24, 52, 28, 64), toSkinVertices(28, 52, 32, 64));
	        var leftLegMesh = new three.Mesh(leftLegBox, layer1Material);
	        var leftLeg2Box = new three.BoxGeometry(4.5 - esp, 13.5 - esp, 4.5 - esp, 0, 0, 0);
	        setVertices(leftLeg2Box, toSkinVertices(4, 48, 8, 52), toSkinVertices(8, 48, 12, 52), toSkinVertices(0, 52, 4, 64), toSkinVertices(4, 52, 8, 64), toSkinVertices(8, 52, 12, 64), toSkinVertices(12, 52, 16, 64));
	        var leftLeg2Mesh = new three.Mesh(leftLeg2Box, layer2Material);
	        leftLeg2Mesh.renderOrder = 1;
	        var leftLegPivot = new three.Group();
	        leftLegPivot.add(leftLegMesh, leftLeg2Mesh);
	        leftLegPivot.position.y = -6;
	        _this.leftLeg = new BodyPart(leftLegMesh, leftLeg2Mesh);
	        _this.leftLeg.name = "leftLeg";
	        _this.leftLeg.add(leftLegPivot);
	        _this.leftLeg.position.y = -16;
	        _this.leftLeg.position.x = 2;
	        _this.add(_this.leftLeg);
	        _this.slim = false;
	        return _this;
	    }
	    Object.defineProperty(SkinObject.prototype, "slim", {
	        get: function () {
	            return this._slim;
	        },
	        set: function (value) {
	            this._slim = value;
	            this.modelListeners.forEach(function (listener) { return listener(); });
	        },
	        enumerable: true,
	        configurable: true
	    });
	    SkinObject.prototype.getBodyParts = function () {
	        return this.children.filter(function (it) { return it instanceof BodyPart; });
	    };
	    SkinObject.prototype.setInnerLayerVisible = function (value) {
	        this.getBodyParts().forEach(function (part) { return part.innerLayer.visible = value; });
	    };
	    SkinObject.prototype.setOuterLayerVisible = function (value) {
	        this.getBodyParts().forEach(function (part) { return part.outerLayer.visible = value; });
	    };
	    return SkinObject;
	}(three.Group));
	var CapeObject = /** @class */ (function (_super) {
	    __extends(CapeObject, _super);
	    function CapeObject(capeMaterial) {
	        var _this = _super.call(this) || this;
	        // back = outside
	        // front = inside
	        var capeBox = new three.BoxGeometry(10, 16, 1, 0, 0, 0);
	        setVertices(capeBox, toCapeVertices(1, 0, 11, 1), toCapeVertices(11, 0, 21, 1), toCapeVertices(11, 1, 12, 17), toCapeVertices(12, 1, 22, 17), toCapeVertices(0, 1, 1, 17), toCapeVertices(1, 1, 11, 17));
	        _this.cape = new three.Mesh(capeBox, capeMaterial);
	        _this.cape.position.y = -8;
	        _this.cape.position.z = -0.5;
	        _this.add(_this.cape);
	        return _this;
	    }
	    return CapeObject;
	}(three.Group));
	var PlayerObject = /** @class */ (function (_super) {
	    __extends(PlayerObject, _super);
	    function PlayerObject(layer1Material, layer2Material, capeMaterial) {
	        var _this = _super.call(this) || this;
	        _this.skin = new SkinObject(layer1Material, layer2Material);
	        _this.skin.name = "skin";
	        _this.skin.visible = false;
	        _this.add(_this.skin);
	        _this.cape = new CapeObject(capeMaterial);
	        _this.cape.name = "cape";
	        _this.cape.position.z = -2;
	        _this.cape.position.y = -4;
	        _this.cape.rotation.x = 25 * Math.PI / 180;
	        _this.cape.visible = false;
	        _this.add(_this.cape);
	        return _this;
	    }
	    return PlayerObject;
	}(three.Group));

	function invokeAnimation(animation, player, time) {
	    if (animation instanceof Function) {
	        animation(player, time);
	    }
	    else {
	        // must be IAnimation here
	        animation.play(player, time);
	    }
	}
	var AnimationWrapper = /** @class */ (function () {
	    function AnimationWrapper(animation) {
	        this.speed = 1.0;
	        this.paused = false;
	        this.progress = 0;
	        this.lastTime = 0;
	        this.started = false;
	        this.toResetAndRemove = false;
	        this.animation = animation;
	    }
	    AnimationWrapper.prototype.play = function (player, time) {
	        if (this.toResetAndRemove) {
	            invokeAnimation(this.animation, player, 0);
	            this.remove();
	            return;
	        }
	        var delta;
	        if (this.started) {
	            delta = time - this.lastTime;
	        }
	        else {
	            delta = 0;
	            this.started = true;
	        }
	        this.lastTime = time;
	        if (!this.paused) {
	            this.progress += delta * this.speed;
	        }
	        invokeAnimation(this.animation, player, this.progress);
	    };
	    AnimationWrapper.prototype.reset = function () {
	        this.progress = 0;
	    };
	    AnimationWrapper.prototype.remove = function () {
	        // stub get's overriden
	    };
	    AnimationWrapper.prototype.resetAndRemove = function () {
	        this.toResetAndRemove = true;
	    };
	    return AnimationWrapper;
	}());
	var CompositeAnimation = /** @class */ (function () {
	    function CompositeAnimation() {
	        this.handles = new Set();
	    }
	    CompositeAnimation.prototype.add = function (animation) {
	        var _this = this;
	        var handle = new AnimationWrapper(animation);
	        handle.remove = function () {
	            _this.handles.delete(handle);
	        };
	        this.handles.add(handle);
	        return handle;
	    };
	    CompositeAnimation.prototype.play = function (player, time) {
	        this.handles.forEach(function (handle) { return handle.play(player, time); });
	    };
	    return CompositeAnimation;
	}());
	var RootAnimation = /** @class */ (function (_super) {
	    __extends(RootAnimation, _super);
	    function RootAnimation() {
	        var _this = _super !== null && _super.apply(this, arguments) || this;
	        _this.speed = 1.0;
	        _this.progress = 0.0;
	        _this.clock = new three.Clock(true);
	        return _this;
	    }
	    Object.defineProperty(RootAnimation.prototype, "animation", {
	        get: function () {
	            return this;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(RootAnimation.prototype, "paused", {
	        get: function () {
	            return !this.clock.running;
	        },
	        set: function (value) {
	            if (value) {
	                this.clock.stop();
	            }
	            else {
	                this.clock.start();
	            }
	        },
	        enumerable: true,
	        configurable: true
	    });
	    RootAnimation.prototype.runAnimationLoop = function (player) {
	        if (this.handles.size === 0) {
	            return;
	        }
	        this.progress += this.clock.getDelta() * this.speed;
	        this.play(player, this.progress);
	    };
	    RootAnimation.prototype.reset = function () {
	        this.progress = 0;
	    };
	    return RootAnimation;
	}(CompositeAnimation));
	var WalkingAnimation = function (player, time) {
	    var skin = player.skin;
	    // Multiply by animation's natural speed
	    time *= 8;
	    // Leg swing
	    skin.leftLeg.rotation.x = Math.sin(time) * 0.5;
	    skin.rightLeg.rotation.x = Math.sin(time + Math.PI) * 0.5;
	    // Arm swing
	    skin.leftArm.rotation.x = Math.sin(time + Math.PI) * 0.5;
	    skin.rightArm.rotation.x = Math.sin(time) * 0.5;
	    var basicArmRotationZ = Math.PI * 0.02;
	    skin.leftArm.rotation.z = Math.cos(time) * 0.03 + basicArmRotationZ;
	    skin.rightArm.rotation.z = Math.cos(time + Math.PI) * 0.03 - basicArmRotationZ;
	    // Head shaking with different frequency & amplitude
	    skin.head.rotation.y = Math.sin(time / 4) * 0.2;
	    skin.head.rotation.x = Math.sin(time / 5) * 0.1;
	    // Always add an angle for cape around the x axis
	    var basicCapeRotationX = Math.PI * 0.06;
	    player.cape.rotation.x = Math.sin(time / 1.5) * 0.06 + basicCapeRotationX;
	};
	var RunningAnimation = function (player, time) {
	    var skin = player.skin;
	    time *= 15;
	    // Leg swing with larger amplitude
	    skin.leftLeg.rotation.x = Math.cos(time + Math.PI) * 1.3;
	    skin.rightLeg.rotation.x = Math.cos(time) * 1.3;
	    // Arm swing
	    skin.leftArm.rotation.x = Math.cos(time) * 1.5;
	    skin.rightArm.rotation.x = Math.cos(time + Math.PI) * 1.5;
	    var basicArmRotationZ = Math.PI * 0.1;
	    skin.leftArm.rotation.z = Math.cos(time) * 0.1 + basicArmRotationZ;
	    skin.rightArm.rotation.z = Math.cos(time + Math.PI) * 0.1 - basicArmRotationZ;
	    // Jumping
	    player.position.y = Math.cos(time * 2);
	    // Dodging when running
	    player.position.x = Math.cos(time) * 0.15;
	    // Slightly tilting when running
	    player.rotation.z = Math.cos(time + Math.PI) * 0.01;
	    // Apply higher swing frequency, lower amplitude,
	    // and greater basic rotation around x axis,
	    // to cape when running.
	    var basicCapeRotationX = Math.PI * 0.3;
	    player.cape.rotation.x = Math.sin(time * 2) * 0.1 + basicCapeRotationX;
	    // What about head shaking?
	    // You shouldn't glance right and left when running dude :P
	};
	var RotatingAnimation = function (player, time) {
	    player.rotation.y = time;
	};

	function copyImage(context, sX, sY, w, h, dX, dY, flipHorizontal) {
	    var imgData = context.getImageData(sX, sY, w, h);
	    if (flipHorizontal) {
	        for (var y = 0; y < h; y++) {
	            for (var x = 0; x < (w / 2); x++) {
	                var index = (x + y * w) * 4;
	                var index2 = ((w - x - 1) + y * w) * 4;
	                var pA1 = imgData.data[index];
	                var pA2 = imgData.data[index + 1];
	                var pA3 = imgData.data[index + 2];
	                var pA4 = imgData.data[index + 3];
	                var pB1 = imgData.data[index2];
	                var pB2 = imgData.data[index2 + 1];
	                var pB3 = imgData.data[index2 + 2];
	                var pB4 = imgData.data[index2 + 3];
	                imgData.data[index] = pB1;
	                imgData.data[index + 1] = pB2;
	                imgData.data[index + 2] = pB3;
	                imgData.data[index + 3] = pB4;
	                imgData.data[index2] = pA1;
	                imgData.data[index2 + 1] = pA2;
	                imgData.data[index2 + 2] = pA3;
	                imgData.data[index2 + 3] = pA4;
	            }
	        }
	    }
	    context.putImageData(imgData, dX, dY);
	}
	function hasTransparency(context, x0, y0, w, h) {
	    var imgData = context.getImageData(x0, y0, w, h);
	    for (var x = 0; x < w; x++) {
	        for (var y = 0; y < h; y++) {
	            var offset = (x + y * w) * 4;
	            if (imgData.data[offset + 3] !== 0xff) {
	                return true;
	            }
	        }
	    }
	    return false;
	}
	function computeSkinScale(width) {
	    return width / 64.0;
	}
	function fixOpaqueSkin(context, width) {
	    // Some ancient skins don't have transparent pixels (nor have helm).
	    // We have to make the helm area transparent, otherwise it will be rendered as black.
	    if (!hasTransparency(context, 0, 0, width, width / 2)) {
	        var scale_1 = computeSkinScale(width);
	        var clearArea = function (x, y, w, h) { return context.clearRect(x * scale_1, y * scale_1, w * scale_1, h * scale_1); };
	        clearArea(40, 0, 8, 8); // Helm Top
	        clearArea(48, 0, 8, 8); // Helm Bottom
	        clearArea(32, 8, 8, 8); // Helm Right
	        clearArea(40, 8, 8, 8); // Helm Front
	        clearArea(48, 8, 8, 8); // Helm Left
	        clearArea(56, 8, 8, 8); // Helm Back
	    }
	}
	function convertSkinTo1_8(context, width) {
	    var scale = computeSkinScale(width);
	    var copySkin = function (sX, sY, w, h, dX, dY, flipHorizontal) { return copyImage(context, sX * scale, sY * scale, w * scale, h * scale, dX * scale, dY * scale, flipHorizontal); };
	    fixOpaqueSkin(context, width);
	    copySkin(4, 16, 4, 4, 20, 48, true); // Top Leg
	    copySkin(8, 16, 4, 4, 24, 48, true); // Bottom Leg
	    copySkin(0, 20, 4, 12, 24, 52, true); // Outer Leg
	    copySkin(4, 20, 4, 12, 20, 52, true); // Front Leg
	    copySkin(8, 20, 4, 12, 16, 52, true); // Inner Leg
	    copySkin(12, 20, 4, 12, 28, 52, true); // Back Leg
	    copySkin(44, 16, 4, 4, 36, 48, true); // Top Arm
	    copySkin(48, 16, 4, 4, 40, 48, true); // Bottom Arm
	    copySkin(40, 20, 4, 12, 40, 52, true); // Outer Arm
	    copySkin(44, 20, 4, 12, 36, 52, true); // Front Arm
	    copySkin(48, 20, 4, 12, 32, 52, true); // Inner Arm
	    copySkin(52, 20, 4, 12, 44, 52, true); // Back Arm
	}
	function loadSkinToCanvas(canvas, image) {
	    var isOldFormat = false;
	    if (image.width !== image.height) {
	        if (image.width === 2 * image.height) {
	            isOldFormat = true;
	        }
	        else {
	            throw new Error("Bad skin size: " + image.width + "x" + image.height);
	        }
	    }
	    var context = canvas.getContext("2d");
	    if (isOldFormat) {
	        var sideLength = image.width;
	        canvas.width = sideLength;
	        canvas.height = sideLength;
	        context.clearRect(0, 0, sideLength, sideLength);
	        context.drawImage(image, 0, 0, sideLength, sideLength / 2.0);
	        convertSkinTo1_8(context, sideLength);
	    }
	    else {
	        canvas.width = image.width;
	        canvas.height = image.height;
	        context.clearRect(0, 0, image.width, image.height);
	        context.drawImage(image, 0, 0, canvas.width, canvas.height);
	    }
	}
	function loadCapeToCanvas(canvas, image) {
	    var isOldFormat = false;
	    if (image.width !== 2 * image.height) {
	        if (image.width * 17 === image.height * 22) {
	            // width/height = 22/17
	            isOldFormat = true;
	        }
	        else {
	            throw new Error("Bad cape size: " + image.width + "x" + image.height);
	        }
	    }
	    var context = canvas.getContext("2d");
	    if (isOldFormat) {
	        var width = image.width * 64 / 22;
	        canvas.width = width;
	        canvas.height = width / 2;
	    }
	    else {
	        canvas.width = image.width;
	        canvas.height = image.height;
	    }
	    context.clearRect(0, 0, canvas.width, canvas.height);
	    context.drawImage(image, 0, 0, image.width, image.height);
	}
	function isSlimSkin(canvasOrImage) {
	    // Detects whether the skin is default or slim.
	    //
	    // The right arm area of *default* skins:
	    // (44,16)->*-------*-------*
	    // (40,20)  |top    |bottom |
	    // \|/      |4x4    |4x4    |
	    //  *-------*-------*-------*-------*
	    //  |right  |front  |left   |back   |
	    //  |4x12   |4x12   |4x12   |4x12   |
	    //  *-------*-------*-------*-------*
	    // The right arm area of *slim* skins:
	    // (44,16)->*------*------*-*
	    // (40,20)  |top   |bottom| |<----[x0=50,y0=16,w=2,h=4]
	    // \|/      |3x4   |3x4   | |
	    //  *-------*------*------***-----*-*
	    //  |right  |front |left   |back  | |<----[x0=54,y0=20,w=2,h=12]
	    //  |4x12   |3x12  |4x12   |3x12  | |
	    //  *-------*------*-------*------*-*
	    // Compared with default right arms, slim right arms have 2 unused areas.
	    //
	    // The same is true for left arm:
	    // The left arm area of *default* skins:
	    // (36,48)->*-------*-------*
	    // (32,52)  |top    |bottom |
	    // \|/      |4x4    |4x4    |
	    //  *-------*-------*-------*-------*
	    //  |right  |front  |left   |back   |
	    //  |4x12   |4x12   |4x12   |4x12   |
	    //  *-------*-------*-------*-------*
	    // The left arm area of *slim* skins:
	    // (36,48)->*------*------*-*
	    // (32,52)  |top   |bottom| |<----[x0=42,y0=48,w=2,h=4]
	    // \|/      |3x4   |3x4   | |
	    //  *-------*------*------***-----*-*
	    //  |right  |front |left   |back  | |<----[x0=46,y0=52,w=2,h=12]
	    //  |4x12   |3x12  |4x12   |3x12  | |
	    //  *-------*------*-------*------*-*
	    //
	    // If there is a transparent pixel in any of the 4 unused areas, the skin must be slim,
	    // as transparent pixels are not allowed in the first layer.
	    if (canvasOrImage instanceof HTMLCanvasElement) {
	        var canvas = canvasOrImage;
	        var scale_2 = computeSkinScale(canvas.width);
	        var context_1 = canvas.getContext("2d");
	        var checkArea = function (x, y, w, h) { return hasTransparency(context_1, x * scale_2, y * scale_2, w * scale_2, h * scale_2); };
	        return checkArea(50, 16, 2, 4) ||
	            checkArea(54, 20, 2, 12) ||
	            checkArea(42, 48, 2, 4) ||
	            checkArea(46, 52, 2, 12);
	    }
	    else {
	        var image = canvasOrImage;
	        var canvas = document.createElement("canvas");
	        loadSkinToCanvas(canvas, image);
	        return isSlimSkin(canvas);
	    }
	}

	var SkinViewer = /** @class */ (function () {
	    function SkinViewer(options) {
	        var _this = this;
	        this.animations = new RootAnimation();
	        this.detectModel = true;
	        this.disposed = false;
	        this._renderPaused = false;
	        this.domElement = options.domElement;
	        if (options.detectModel === false) {
	            this.detectModel = false;
	        }
	        // texture
	        this.skinImg = new Image();
	        this.skinCanvas = document.createElement("canvas");
	        this.skinTexture = new three.Texture(this.skinCanvas);
	        this.skinTexture.magFilter = three.NearestFilter;
	        this.skinTexture.minFilter = three.NearestFilter;
	        this.capeImg = new Image();
	        this.capeCanvas = document.createElement("canvas");
	        this.capeTexture = new three.Texture(this.capeCanvas);
	        this.capeTexture.magFilter = three.NearestFilter;
	        this.capeTexture.minFilter = three.NearestFilter;
	        this.layer1Material = new three.MeshBasicMaterial({ map: this.skinTexture, side: three.FrontSide });
	        this.layer2Material = new three.MeshBasicMaterial({ map: this.skinTexture, transparent: true, opacity: 1, side: three.DoubleSide, alphaTest: 0.5 });
	        this.capeMaterial = new three.MeshBasicMaterial({ map: this.capeTexture, transparent: true, opacity: 1, side: three.DoubleSide, alphaTest: 0.5 });
	        // scene
	        this.scene = new three.Scene();
	        // Use smaller fov to avoid distortion
	        this.camera = new three.PerspectiveCamera(40);
	        this.camera.position.y = -12;
	        this.camera.position.z = 60;
	        this.renderer = new three.WebGLRenderer({ alpha: true, antialias: false });
	        this.renderer.setSize(300, 300); // default size
	        this.domElement.appendChild(this.renderer.domElement);
	        this.playerObject = new PlayerObject(this.layer1Material, this.layer2Material, this.capeMaterial);
	        this.playerObject.name = "player";
	        this.scene.add(this.playerObject);
	        // texture loading
	        this.skinImg.crossOrigin = "anonymous";
	        this.skinImg.onerror = function () { return console.error("Failed loading " + _this.skinImg.src); };
	        this.skinImg.onload = function () {
	            loadSkinToCanvas(_this.skinCanvas, _this.skinImg);
	            if (_this.detectModel) {
	                _this.playerObject.skin.slim = isSlimSkin(_this.skinCanvas);
	            }
	            _this.skinTexture.needsUpdate = true;
	            _this.layer1Material.needsUpdate = true;
	            _this.layer2Material.needsUpdate = true;
	            _this.playerObject.skin.visible = true;
	        };
	        this.capeImg.crossOrigin = "anonymous";
	        this.capeImg.onerror = function () { return console.error("Failed loading " + _this.capeImg.src); };
	        this.capeImg.onload = function () {
	            loadCapeToCanvas(_this.capeCanvas, _this.capeImg);
	            _this.capeTexture.needsUpdate = true;
	            _this.capeMaterial.needsUpdate = true;
	            _this.playerObject.cape.visible = true;
	        };
	        if (options.skinUrl)
	            this.skinUrl = options.skinUrl;
	        if (options.capeUrl)
	            this.capeUrl = options.capeUrl;
	        if (options.width)
	            this.width = options.width;
	        if (options.height)
	            this.height = options.height;
	        window.requestAnimationFrame(function () { return _this.draw(); });
	    }
	    SkinViewer.prototype.draw = function () {
	        var _this = this;
	        if (this.disposed || this._renderPaused) {
	            return;
	        }
	        this.animations.runAnimationLoop(this.playerObject);
	        this.renderer.render(this.scene, this.camera);
	        window.requestAnimationFrame(function () { return _this.draw(); });
	    };
	    SkinViewer.prototype.setSize = function (width, height) {
	        this.camera.aspect = width / height;
	        this.camera.updateProjectionMatrix();
	        this.renderer.setSize(width, height);
	    };
	    SkinViewer.prototype.dispose = function () {
	        this.disposed = true;
	        this.domElement.removeChild(this.renderer.domElement);
	        this.renderer.dispose();
	        this.skinTexture.dispose();
	        this.capeTexture.dispose();
	    };
	    Object.defineProperty(SkinViewer.prototype, "renderPaused", {
	        get: function () {
	            return this._renderPaused;
	        },
	        set: function (value) {
	            var _this = this;
	            var toResume = !this.disposed && !value && this._renderPaused;
	            this._renderPaused = value;
	            if (toResume) {
	                window.requestAnimationFrame(function () { return _this.draw(); });
	            }
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(SkinViewer.prototype, "skinUrl", {
	        get: function () {
	            return this.skinImg.src;
	        },
	        set: function (url) {
	            this.skinImg.src = url;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(SkinViewer.prototype, "capeUrl", {
	        get: function () {
	            return this.capeImg.src;
	        },
	        set: function (url) {
	            this.capeImg.src = url;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(SkinViewer.prototype, "width", {
	        get: function () {
	            var target = new three.Vector2();
	            return this.renderer.getSize(target).width;
	        },
	        set: function (newWidth) {
	            this.setSize(newWidth, this.height);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(SkinViewer.prototype, "height", {
	        get: function () {
	            var target = new three.Vector2();
	            return this.renderer.getSize(target).height;
	        },
	        set: function (newHeight) {
	            this.setSize(this.width, newHeight);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    return SkinViewer;
	}());

	var STATE = {
	    NONE: -1,
	    ROTATE: 0,
	    DOLLY: 1,
	    PAN: 2,
	    TOUCH_ROTATE: 3,
	    TOUCH_DOLLY: 4,
	    TOUCH_PAN: 5
	};
	var CHANGE_EVENT = { type: "change" };
	var START_EVENT = { type: "start" };
	var END_EVENT = { type: "end" };
	var EPS = 0.000001;
	var OrbitControls = /** @class */ (function (_super) {
	    __extends(OrbitControls, _super);
	    function OrbitControls(object, domElement, domWindow) {
	        var _this = _super.call(this) || this;
	        _this.object = object;
	        _this.domElement = (domElement !== undefined) ? domElement : document;
	        _this.window = (domWindow !== undefined) ? domWindow : window;
	        // Set to false to disable this control
	        _this.enabled = true;
	        // "target" sets the location of focus, where the object orbits around
	        _this.target = new three.Vector3();
	        // How far you can dolly in and out ( PerspectiveCamera only )
	        _this.minDistance = 0;
	        _this.maxDistance = Infinity;
	        // How far you can zoom in and out ( OrthographicCamera only )
	        _this.minZoom = 0;
	        _this.maxZoom = Infinity;
	        // How far you can orbit vertically, upper and lower limits.
	        // Range is 0 to Math.PI radians.
	        _this.minPolarAngle = 0; // radians
	        _this.maxPolarAngle = Math.PI; // radians
	        // How far you can orbit horizontally, upper and lower limits.
	        // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	        _this.minAzimuthAngle = -Infinity; // radians
	        _this.maxAzimuthAngle = Infinity; // radians
	        // Set to true to enable damping (inertia)
	        // If damping is enabled, you must call controls.update() in your animation loop
	        _this.enableDamping = false;
	        _this.dampingFactor = 0.25;
	        // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	        // Set to false to disable zooming
	        _this.enableZoom = true;
	        _this.zoomSpeed = 1.0;
	        // Set to false to disable rotating
	        _this.enableRotate = true;
	        _this.rotateSpeed = 1.0;
	        // Set to false to disable panning
	        _this.enablePan = true;
	        _this.keyPanSpeed = 7.0; // pixels moved per arrow key push
	        // Set to true to automatically rotate around the target
	        // If auto-rotate is enabled, you must call controls.update() in your animation loop
	        _this.autoRotate = false;
	        _this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
	        // Set to false to disable use of the keys
	        _this.enableKeys = true;
	        // The four arrow keys
	        _this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
	        // Mouse buttons
	        _this.mouseButtons = { ORBIT: three.MOUSE.LEFT, ZOOM: three.MOUSE.MIDDLE, PAN: three.MOUSE.RIGHT };
	        // for reset
	        _this.target0 = _this.target.clone();
	        _this.position0 = _this.object.position.clone();
	        _this.zoom0 = _this.object.zoom;
	        // for update speedup
	        _this.updateOffset = new three.Vector3();
	        // so camera.up is the orbit axis
	        _this.updateQuat = new three.Quaternion().setFromUnitVectors(object.up, new three.Vector3(0, 1, 0));
	        _this.updateQuatInverse = _this.updateQuat.clone().inverse();
	        _this.updateLastPosition = new three.Vector3();
	        _this.updateLastQuaternion = new three.Quaternion();
	        _this.state = STATE.NONE;
	        _this.scale = 1;
	        // current position in spherical coordinates
	        _this.spherical = new three.Spherical();
	        _this.sphericalDelta = new three.Spherical();
	        _this.panOffset = new three.Vector3();
	        _this.zoomChanged = false;
	        _this.rotateStart = new three.Vector2();
	        _this.rotateEnd = new three.Vector2();
	        _this.rotateDelta = new three.Vector2();
	        _this.panStart = new three.Vector2();
	        _this.panEnd = new three.Vector2();
	        _this.panDelta = new three.Vector2();
	        _this.dollyStart = new three.Vector2();
	        _this.dollyEnd = new three.Vector2();
	        _this.dollyDelta = new three.Vector2();
	        _this.panLeftV = new three.Vector3();
	        _this.panUpV = new three.Vector3();
	        _this.panInternalOffset = new three.Vector3();
	        // event handlers - FSM: listen for events and reset state
	        _this.onMouseDown = function (event) {
	            if (_this.enabled === false)
	                return;
	            event.preventDefault();
	            if (event.button === _this.mouseButtons.ORBIT) {
	                if (_this.enableRotate === false)
	                    return;
	                _this.rotateStart.set(event.clientX, event.clientY);
	                _this.state = STATE.ROTATE;
	            }
	            else if (event.button === _this.mouseButtons.ZOOM) {
	                if (_this.enableZoom === false)
	                    return;
	                _this.dollyStart.set(event.clientX, event.clientY);
	                _this.state = STATE.DOLLY;
	            }
	            else if (event.button === _this.mouseButtons.PAN) {
	                if (_this.enablePan === false)
	                    return;
	                _this.panStart.set(event.clientX, event.clientY);
	                _this.state = STATE.PAN;
	            }
	            if (_this.state !== STATE.NONE) {
	                document.addEventListener("mousemove", _this.onMouseMove, false);
	                document.addEventListener("mouseup", _this.onMouseUp, false);
	                _this.dispatchEvent(START_EVENT);
	            }
	        };
	        _this.onMouseMove = function (event) {
	            if (_this.enabled === false)
	                return;
	            event.preventDefault();
	            if (_this.state === STATE.ROTATE) {
	                if (_this.enableRotate === false)
	                    return;
	                _this.rotateEnd.set(event.clientX, event.clientY);
	                _this.rotateDelta.subVectors(_this.rotateEnd, _this.rotateStart);
	                var element = _this.domElement === document ? _this.domElement.body : _this.domElement;
	                // rotating across whole screen goes 360 degrees around
	                _this.rotateLeft(2 * Math.PI * _this.rotateDelta.x / element.clientWidth * _this.rotateSpeed);
	                // rotating up and down along whole screen attempts to go 360, but limited to 180
	                _this.rotateUp(2 * Math.PI * _this.rotateDelta.y / element.clientHeight * _this.rotateSpeed);
	                _this.rotateStart.copy(_this.rotateEnd);
	                _this.update();
	            }
	            else if (_this.state === STATE.DOLLY) {
	                if (_this.enableZoom === false)
	                    return;
	                _this.dollyEnd.set(event.clientX, event.clientY);
	                _this.dollyDelta.subVectors(_this.dollyEnd, _this.dollyStart);
	                if (_this.dollyDelta.y > 0) {
	                    _this.dollyIn(_this.getZoomScale());
	                }
	                else if (_this.dollyDelta.y < 0) {
	                    _this.dollyOut(_this.getZoomScale());
	                }
	                _this.dollyStart.copy(_this.dollyEnd);
	                _this.update();
	            }
	            else if (_this.state === STATE.PAN) {
	                if (_this.enablePan === false)
	                    return;
	                _this.panEnd.set(event.clientX, event.clientY);
	                _this.panDelta.subVectors(_this.panEnd, _this.panStart);
	                _this.pan(_this.panDelta.x, _this.panDelta.y);
	                _this.panStart.copy(_this.panEnd);
	                _this.update();
	            }
	        };
	        _this.onMouseUp = function (event) {
	            if (_this.enabled === false)
	                return;
	            document.removeEventListener("mousemove", _this.onMouseMove, false);
	            document.removeEventListener("mouseup", _this.onMouseUp, false);
	            _this.dispatchEvent(END_EVENT);
	            _this.state = STATE.NONE;
	        };
	        _this.onMouseWheel = function (event) {
	            if (_this.enabled === false || _this.enableZoom === false || (_this.state !== STATE.NONE && _this.state !== STATE.ROTATE))
	                return;
	            event.preventDefault();
	            event.stopPropagation();
	            if (event.deltaY < 0) {
	                _this.dollyOut(_this.getZoomScale());
	            }
	            else if (event.deltaY > 0) {
	                _this.dollyIn(_this.getZoomScale());
	            }
	            _this.update();
	            _this.dispatchEvent(START_EVENT); // not sure why these are here...
	            _this.dispatchEvent(END_EVENT);
	        };
	        _this.onKeyDown = function (event) {
	            if (_this.enabled === false || _this.enableKeys === false || _this.enablePan === false)
	                return;
	            switch (event.keyCode) {
	                case _this.keys.UP: {
	                    _this.pan(0, _this.keyPanSpeed);
	                    _this.update();
	                    break;
	                }
	                case _this.keys.BOTTOM: {
	                    _this.pan(0, -_this.keyPanSpeed);
	                    _this.update();
	                    break;
	                }
	                case _this.keys.LEFT: {
	                    _this.pan(_this.keyPanSpeed, 0);
	                    _this.update();
	                    break;
	                }
	                case _this.keys.RIGHT: {
	                    _this.pan(-_this.keyPanSpeed, 0);
	                    _this.update();
	                    break;
	                }
	            }
	        };
	        _this.onTouchStart = function (event) {
	            if (_this.enabled === false)
	                return;
	            switch (event.touches.length) {
	                // one-fingered touch: rotate
	                case 1: {
	                    if (_this.enableRotate === false)
	                        return;
	                    _this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
	                    _this.state = STATE.TOUCH_ROTATE;
	                    break;
	                }
	                // two-fingered touch: dolly
	                case 2: {
	                    if (_this.enableZoom === false)
	                        return;
	                    var dx = event.touches[0].pageX - event.touches[1].pageX;
	                    var dy = event.touches[0].pageY - event.touches[1].pageY;
	                    var distance = Math.sqrt(dx * dx + dy * dy);
	                    _this.dollyStart.set(0, distance);
	                    _this.state = STATE.TOUCH_DOLLY;
	                    break;
	                }
	                // three-fingered touch: pan
	                case 3: {
	                    if (_this.enablePan === false)
	                        return;
	                    _this.panStart.set(event.touches[0].pageX, event.touches[0].pageY);
	                    _this.state = STATE.TOUCH_PAN;
	                    break;
	                }
	                default: {
	                    _this.state = STATE.NONE;
	                }
	            }
	            if (_this.state !== STATE.NONE) {
	                _this.dispatchEvent(START_EVENT);
	            }
	        };
	        _this.onTouchMove = function (event) {
	            if (_this.enabled === false)
	                return;
	            event.preventDefault();
	            event.stopPropagation();
	            switch (event.touches.length) {
	                // one-fingered touch: rotate
	                case 1: {
	                    if (_this.enableRotate === false)
	                        return;
	                    if (_this.state !== STATE.TOUCH_ROTATE)
	                        return; // is this needed?...
	                    _this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
	                    _this.rotateDelta.subVectors(_this.rotateEnd, _this.rotateStart);
	                    var element = _this.domElement === document ? _this.domElement.body : _this.domElement;
	                    // rotating across whole screen goes 360 degrees around
	                    _this.rotateLeft(2 * Math.PI * _this.rotateDelta.x / element.clientWidth * _this.rotateSpeed);
	                    // rotating up and down along whole screen attempts to go 360, but limited to 180
	                    _this.rotateUp(2 * Math.PI * _this.rotateDelta.y / element.clientHeight * _this.rotateSpeed);
	                    _this.rotateStart.copy(_this.rotateEnd);
	                    _this.update();
	                    break;
	                }
	                // two-fingered touch: dolly
	                case 2: {
	                    if (_this.enableZoom === false)
	                        return;
	                    if (_this.state !== STATE.TOUCH_DOLLY)
	                        return; // is this needed?...
	                    // console.log( "handleTouchMoveDolly" );
	                    var dx = event.touches[0].pageX - event.touches[1].pageX;
	                    var dy = event.touches[0].pageY - event.touches[1].pageY;
	                    var distance = Math.sqrt(dx * dx + dy * dy);
	                    _this.dollyEnd.set(0, distance);
	                    _this.dollyDelta.subVectors(_this.dollyEnd, _this.dollyStart);
	                    if (_this.dollyDelta.y > 0) {
	                        _this.dollyOut(_this.getZoomScale());
	                    }
	                    else if (_this.dollyDelta.y < 0) {
	                        _this.dollyIn(_this.getZoomScale());
	                    }
	                    _this.dollyStart.copy(_this.dollyEnd);
	                    _this.update();
	                    break;
	                }
	                // three-fingered touch: pan
	                case 3: {
	                    if (_this.enablePan === false)
	                        return;
	                    if (_this.state !== STATE.TOUCH_PAN)
	                        return; // is this needed?...
	                    _this.panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
	                    _this.panDelta.subVectors(_this.panEnd, _this.panStart);
	                    _this.pan(_this.panDelta.x, _this.panDelta.y);
	                    _this.panStart.copy(_this.panEnd);
	                    _this.update();
	                    break;
	                }
	                default: {
	                    _this.state = STATE.NONE;
	                }
	            }
	        };
	        _this.onTouchEnd = function (event) {
	            if (_this.enabled === false)
	                return;
	            _this.dispatchEvent(END_EVENT);
	            _this.state = STATE.NONE;
	        };
	        _this.onContextMenu = function (event) {
	            event.preventDefault();
	        };
	        _this.domElement.addEventListener("contextmenu", _this.onContextMenu, false);
	        _this.domElement.addEventListener("mousedown", _this.onMouseDown, false);
	        _this.domElement.addEventListener("wheel", _this.onMouseWheel, false);
	        _this.domElement.addEventListener("touchstart", _this.onTouchStart, false);
	        _this.domElement.addEventListener("touchend", _this.onTouchEnd, false);
	        _this.domElement.addEventListener("touchmove", _this.onTouchMove, false);
	        _this.window.addEventListener("keydown", _this.onKeyDown, false);
	        // force an update at start
	        _this.update();
	        return _this;
	    }
	    OrbitControls.prototype.update = function () {
	        var position = this.object.position;
	        this.updateOffset.copy(position).sub(this.target);
	        // rotate offset to "y-axis-is-up" space
	        this.updateOffset.applyQuaternion(this.updateQuat);
	        // angle from z-axis around y-axis
	        this.spherical.setFromVector3(this.updateOffset);
	        if (this.autoRotate && this.state === STATE.NONE) {
	            this.rotateLeft(this.getAutoRotationAngle());
	        }
	        this.spherical.theta += this.sphericalDelta.theta;
	        this.spherical.phi += this.sphericalDelta.phi;
	        // restrict theta to be between desired limits
	        this.spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.spherical.theta));
	        // restrict phi to be between desired limits
	        this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));
	        this.spherical.makeSafe();
	        this.spherical.radius *= this.scale;
	        // restrict radius to be between desired limits
	        this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));
	        // move target to panned location
	        this.target.add(this.panOffset);
	        this.updateOffset.setFromSpherical(this.spherical);
	        // rotate offset back to "camera-up-vector-is-up" space
	        this.updateOffset.applyQuaternion(this.updateQuatInverse);
	        position.copy(this.target).add(this.updateOffset);
	        this.object.lookAt(this.target);
	        if (this.enableDamping === true) {
	            this.sphericalDelta.theta *= (1 - this.dampingFactor);
	            this.sphericalDelta.phi *= (1 - this.dampingFactor);
	        }
	        else {
	            this.sphericalDelta.set(0, 0, 0);
	        }
	        this.scale = 1;
	        this.panOffset.set(0, 0, 0);
	        // update condition is:
	        // min(camera displacement, camera rotation in radians)^2 > EPS
	        // using small-angle approximation cos(x/2) = 1 - x^2 / 8
	        if (this.zoomChanged ||
	            this.updateLastPosition.distanceToSquared(this.object.position) > EPS ||
	            8 * (1 - this.updateLastQuaternion.dot(this.object.quaternion)) > EPS) {
	            this.dispatchEvent(CHANGE_EVENT);
	            this.updateLastPosition.copy(this.object.position);
	            this.updateLastQuaternion.copy(this.object.quaternion);
	            this.zoomChanged = false;
	            return true;
	        }
	        return false;
	    };
	    OrbitControls.prototype.panLeft = function (distance, objectMatrix) {
	        this.panLeftV.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
	        this.panLeftV.multiplyScalar(-distance);
	        this.panOffset.add(this.panLeftV);
	    };
	    OrbitControls.prototype.panUp = function (distance, objectMatrix) {
	        this.panUpV.setFromMatrixColumn(objectMatrix, 1); // get Y column of objectMatrix
	        this.panUpV.multiplyScalar(distance);
	        this.panOffset.add(this.panUpV);
	    };
	    // deltaX and deltaY are in pixels; right and down are positive
	    OrbitControls.prototype.pan = function (deltaX, deltaY) {
	        var element = this.domElement === document ? this.domElement.body : this.domElement;
	        if (this.object instanceof three.PerspectiveCamera) {
	            // perspective
	            var position = this.object.position;
	            this.panInternalOffset.copy(position).sub(this.target);
	            var targetDistance = this.panInternalOffset.length();
	            // half of the fov is center to top of screen
	            targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0);
	            // we actually don"t use screenWidth, since perspective camera is fixed to screen height
	            this.panLeft(2 * deltaX * targetDistance / element.clientHeight, this.object.matrix);
	            this.panUp(2 * deltaY * targetDistance / element.clientHeight, this.object.matrix);
	        }
	        else if (this.object instanceof three.OrthographicCamera) {
	            // orthographic
	            this.panLeft(deltaX * (this.object.right - this.object.left) / this.object.zoom / element.clientWidth, this.object.matrix);
	            this.panUp(deltaY * (this.object.top - this.object.bottom) / this.object.zoom / element.clientHeight, this.object.matrix);
	        }
	        else {
	            // camera neither orthographic nor perspective
	            console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.");
	            this.enablePan = false;
	        }
	    };
	    OrbitControls.prototype.dollyIn = function (dollyScale) {
	        if (this.object instanceof three.PerspectiveCamera) {
	            this.scale /= dollyScale;
	        }
	        else if (this.object instanceof three.OrthographicCamera) {
	            this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale));
	            this.object.updateProjectionMatrix();
	            this.zoomChanged = true;
	        }
	        else {
	            console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
	            this.enableZoom = false;
	        }
	    };
	    OrbitControls.prototype.dollyOut = function (dollyScale) {
	        if (this.object instanceof three.PerspectiveCamera) {
	            this.scale *= dollyScale;
	        }
	        else if (this.object instanceof three.OrthographicCamera) {
	            this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale));
	            this.object.updateProjectionMatrix();
	            this.zoomChanged = true;
	        }
	        else {
	            console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
	            this.enableZoom = false;
	        }
	    };
	    OrbitControls.prototype.getAutoRotationAngle = function () {
	        return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
	    };
	    OrbitControls.prototype.getZoomScale = function () {
	        return Math.pow(0.95, this.zoomSpeed);
	    };
	    OrbitControls.prototype.rotateLeft = function (angle) {
	        this.sphericalDelta.theta -= angle;
	    };
	    OrbitControls.prototype.rotateUp = function (angle) {
	        this.sphericalDelta.phi -= angle;
	    };
	    OrbitControls.prototype.getPolarAngle = function () {
	        return this.spherical.phi;
	    };
	    OrbitControls.prototype.getAzimuthalAngle = function () {
	        return this.spherical.theta;
	    };
	    OrbitControls.prototype.dispose = function () {
	        this.domElement.removeEventListener("contextmenu", this.onContextMenu, false);
	        this.domElement.removeEventListener("mousedown", this.onMouseDown, false);
	        this.domElement.removeEventListener("wheel", this.onMouseWheel, false);
	        this.domElement.removeEventListener("touchstart", this.onTouchStart, false);
	        this.domElement.removeEventListener("touchend", this.onTouchEnd, false);
	        this.domElement.removeEventListener("touchmove", this.onTouchMove, false);
	        document.removeEventListener("mousemove", this.onMouseMove, false);
	        document.removeEventListener("mouseup", this.onMouseUp, false);
	        this.window.removeEventListener("keydown", this.onKeyDown, false);
	        // this.dispatchEvent( { type: "dispose" } ); // should this be added here?
	    };
	    OrbitControls.prototype.reset = function () {
	        this.target.copy(this.target0);
	        this.object.position.copy(this.position0);
	        this.object.zoom = this.zoom0;
	        this.object.updateProjectionMatrix();
	        this.dispatchEvent(CHANGE_EVENT);
	        this.update();
	        this.state = STATE.NONE;
	    };
	    return OrbitControls;
	}(three.EventDispatcher));
	function createOrbitControls(skinViewer) {
	    var control = new OrbitControls(skinViewer.camera, skinViewer.renderer.domElement);
	    // default configuration
	    control.enablePan = false;
	    control.target = new three.Vector3(0, -12, 0);
	    control.minDistance = 10;
	    control.maxDistance = 256;
	    control.update();
	    return control;
	}

	exports.BodyPart = BodyPart;
	exports.CapeObject = CapeObject;
	exports.CompositeAnimation = CompositeAnimation;
	exports.OrbitControls = OrbitControls;
	exports.PlayerObject = PlayerObject;
	exports.RootAnimation = RootAnimation;
	exports.RotatingAnimation = RotatingAnimation;
	exports.RunningAnimation = RunningAnimation;
	exports.SkinObject = SkinObject;
	exports.SkinViewer = SkinViewer;
	exports.WalkingAnimation = WalkingAnimation;
	exports.createOrbitControls = createOrbitControls;
	exports.invokeAnimation = invokeAnimation;
	exports.isSlimSkin = isSlimSkin;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
