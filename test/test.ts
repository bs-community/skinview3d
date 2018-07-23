import { expect } from "chai";
import * as skinview3d from "../src/skinview3d";

import skin1_8Default from "./textures/skin-1.8-default-no_hd.png";
import skin1_8Slim from "./textures/skin-1.8-slim-no_hd.png";
import skinOldDefault from "./textures/skin-old-default-no_hd.png";

describe("detect model of texture", () => {
	it("1.8 default", async () => {
		const image = document.createElement("img");
		image.src = skin1_8Default;
		await Promise.resolve();
		expect(skinview3d.isSlimSkin(image)).to.equal(false);
	});

	it("1.8 slim", async () => {
		const image = document.createElement("img");
		image.src = skin1_8Slim;
		await Promise.resolve();
		expect(skinview3d.isSlimSkin(image)).to.equal(true);
	});

	it("old default", async () => {
		const image = document.createElement("img");
		image.src = skinOldDefault;
		await Promise.resolve();
		expect(skinview3d.isSlimSkin(image)).to.equal(false);
	});
});