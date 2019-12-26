/// <reference path="shims.d.ts"/>

import { expect } from "chai";
import { isSlimSkin, loadSkinToCanvas } from "../src/utils";

import skin1_8Default from "./textures/skin-1.8-default-no_hd.png";
import skin1_8Slim from "./textures/skin-1.8-slim-no_hd.png";
import skinOldDefault from "./textures/skin-old-default-no_hd.png";
import skinLegacyHatDefault from "./textures/skin-legacyhat-default-no_hd.png";

describe("detect model of texture", () => {
	it("1.8 default", async () => {
		const image = document.createElement("img");
		image.src = skin1_8Default;
		await Promise.resolve();
		expect(isSlimSkin(image)).to.equal(false);
	});

	it("1.8 slim", async () => {
		const image = document.createElement("img");
		image.src = skin1_8Slim;
		await Promise.resolve();
		expect(isSlimSkin(image)).to.equal(true);
	});

	it("old default", async () => {
		const image = document.createElement("img");
		image.src = skinOldDefault;
		await Promise.resolve();
		expect(isSlimSkin(image)).to.equal(false);
	});
});

describe("process skin texture", () => {
	it("clear the hat area of legacy skin", async () => {
		const image = document.createElement("img");
		image.src = skinLegacyHatDefault;
		await Promise.resolve();
		const canvas = document.createElement("canvas");
		loadSkinToCanvas(canvas, image);
		const data = canvas.getContext("2d")!.getImageData(0, 0, 64, 32).data;
		const checkArea = (x0, y0, w, h) => {
			for (let x = x0; x < x0 + w; x++) {
				for (let y = y0; y < y0 + h; y++) {
					expect(data[(y * 64 + x) * 4 + 3]).to.equal(0);
				}
			}
		};
		checkArea(40, 0, 8 * 2, 8); // top + bottom
		checkArea(32, 8, 8 * 4, 8) // right + front + left + back
	});
});
