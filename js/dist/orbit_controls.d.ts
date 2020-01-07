import { Camera, EventDispatcher, MOUSE, Vector3 } from "three";
import { SkinViewer } from "./viewer";
export declare class OrbitControls extends EventDispatcher {
    /**
     * @preserve
     * The code was originally from https://github.com/mrdoob/three.js/blob/d45a042cf962e9b1aa9441810ba118647b48aacb/examples/js/controls/OrbitControls.js
     */
    /**
     * @license
     * Copyright (C) 2010-2017 three.js authors
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
     *
     *
     * @author qiao / https://github.com/qiao
     * @author mrdoob / http://mrdoob.com
     * @author alteredq / http://alteredqualia.com/
     * @author WestLangley / http://github.com/WestLangley
     * @author erich666 / http://erichaines.com
     */
    object: Camera;
    domElement: HTMLElement | HTMLDocument;
    window: Window;
    enabled: boolean;
    target: Vector3;
    enableZoom: boolean;
    zoomSpeed: number;
    minDistance: number;
    maxDistance: number;
    enableRotate: boolean;
    rotateSpeed: number;
    enablePan: boolean;
    keyPanSpeed: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
    minZoom: number;
    maxZoom: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number;
    maxAzimuthAngle: number;
    enableKeys: boolean;
    keys: {
        LEFT: number;
        UP: number;
        RIGHT: number;
        BOTTOM: number;
    };
    mouseButtons: {
        ORBIT: MOUSE;
        ZOOM: MOUSE;
        PAN: MOUSE;
    };
    enableDamping: boolean;
    dampingFactor: number;
    private spherical;
    private sphericalDelta;
    private scale;
    private target0;
    private position0;
    private zoom0;
    private state;
    private panOffset;
    private zoomChanged;
    private rotateStart;
    private rotateEnd;
    private rotateDelta;
    private panStart;
    private panEnd;
    private panDelta;
    private dollyStart;
    private dollyEnd;
    private dollyDelta;
    private updateLastPosition;
    private updateOffset;
    private updateQuat;
    private updateLastQuaternion;
    private updateQuatInverse;
    private panLeftV;
    private panUpV;
    private panInternalOffset;
    private onContextMenu;
    private onMouseUp;
    private onMouseDown;
    private onMouseMove;
    private onMouseWheel;
    private onTouchStart;
    private onTouchEnd;
    private onTouchMove;
    private onKeyDown;
    constructor(object: Camera, domElement?: HTMLElement, domWindow?: Window);
    update(): boolean;
    panLeft(distance: number, objectMatrix: any): void;
    panUp(distance: number, objectMatrix: any): void;
    pan(deltaX: number, deltaY: number): void;
    dollyIn(dollyScale: any): void;
    dollyOut(dollyScale: any): void;
    getAutoRotationAngle(): number;
    getZoomScale(): number;
    rotateLeft(angle: number): void;
    rotateUp(angle: number): void;
    getPolarAngle(): number;
    getAzimuthalAngle(): number;
    dispose(): void;
    reset(): void;
}
export declare function createOrbitControls(skinViewer: SkinViewer): OrbitControls;
