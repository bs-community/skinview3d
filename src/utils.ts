function copyImage(context, sX, sY, w, h, dX, dY, flipHorizontal) {
	const imgData = context.getImageData(sX, sY, w, h);
	if (flipHorizontal) {
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < (w / 2); x++) {
				const index = (x + y * w) * 4;
				const index2 = ((w - x - 1) + y * w) * 4;
				const pA1 = imgData.data[index];
				const pA2 = imgData.data[index + 1];
				const pA3 = imgData.data[index + 2];
				const pA4 = imgData.data[index + 3];

				const pB1 = imgData.data[index2];
				const pB2 = imgData.data[index2 + 1];
				const pB3 = imgData.data[index2 + 2];
				const pB4 = imgData.data[index2 + 3];

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
	const imgData = context.getImageData(x0, y0, w, h);
	for (let x = 0; x < w; x++) {
		for (let y = 0; y < h; y++) {
			const offset = (x + y * w) * 4;
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
		const scale = computeSkinScale(width);
		const clearArea = (x, y, w, h) => context.clearRect(x * scale, y * scale, w * scale, h * scale);
		clearArea(40, 0, 8, 8); // Helm Top
		clearArea(48, 0, 8, 8); // Helm Bottom
		clearArea(32, 8, 8, 8); // Helm Right
		clearArea(40, 8, 8, 8); // Helm Front
		clearArea(48, 8, 8, 8); // Helm Left
		clearArea(56, 8, 8, 8); // Helm Back
	}
}

function convertSkinTo1_8(context, width) {
	const scale = computeSkinScale(width);
	const copySkin = (sX, sY, w, h, dX, dY, flipHorizontal) => copyImage(context, sX * scale, sY * scale, w * scale, h * scale, dX * scale, dY * scale, flipHorizontal);

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

export function loadSkinToCanvas(canvas, image) {
	let isOldFormat = false;
	if (image.width !== image.height) {
		if (image.width === 2 * image.height) {
			isOldFormat = true;
		} else {
			throw new Error(`Bad skin size: ${image.width}x${image.height}`);
		}
	}

	const context = canvas.getContext("2d");
	if (isOldFormat) {
		const sideLength = image.width;
		canvas.width = sideLength;
		canvas.height = sideLength;
		context.clearRect(0, 0, sideLength, sideLength);
		context.drawImage(image, 0, 0, sideLength, sideLength / 2.0);
		convertSkinTo1_8(context, sideLength);
	} else {
		canvas.width = image.width;
		canvas.height = image.height;
		context.clearRect(0, 0, image.width, image.height);
		context.drawImage(image, 0, 0, canvas.width, canvas.height);
	}
}

export function loadCapeToCanvas(canvas, image) {
	let isOldFormat = false;
	if (image.width !== 2 * image.height) {
		if (image.width * 17 === image.height * 22) {
			// width/height = 22/17
			isOldFormat = true;
		} else {
			throw new Error(`Bad cape size: ${image.width}x${image.height}`);
		}
	}

	const context = canvas.getContext("2d");
	if (isOldFormat) {
		const width = image.width * 64 / 22;
		canvas.width = width;
		canvas.height = width / 2;
	} else {
		canvas.width = image.width;
		canvas.height = image.height;
	}
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.drawImage(image, 0, 0, image.width, image.height);
}

export function isSlimSkin(canvasOrImage) {
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
		const canvas = canvasOrImage;
		const scale = computeSkinScale(canvas.width);
		const context = canvas.getContext("2d");
		const checkArea = (x, y, w, h) => hasTransparency(context, x * scale, y * scale, w * scale, h * scale);
		return checkArea(50, 16, 2, 4) ||
			checkArea(54, 20, 2, 12) ||
			checkArea(42, 48, 2, 4) ||
			checkArea(46, 52, 2, 12);
	} else if (canvasOrImage instanceof HTMLImageElement) {
		const image = canvasOrImage;
		const canvas = document.createElement("canvas");
		loadSkinToCanvas(canvas, image);
		return isSlimSkin(canvas);
	} else {
		throw new Error(`Illegal argument: ${canvasOrImage}`);
	}
}
