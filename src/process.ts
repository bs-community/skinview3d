function computeSkinScale(width: number): number {
	return width / 64.0;
}

function fixOpaqueSkin(context: CanvasImageData & CanvasRect, width: number, format1_8: boolean, allowTransparency: boolean): void {
	// see https://github.com/bs-community/skinview3d/issues/15
	// see https://github.com/bs-community/skinview3d/issues/93

	// check whether the skin has opaque background
	if (format1_8) {
		if (hasTransparency(context, 0, 0, width, width))
			return;
	} else {
		if (hasTransparency(context, 0, 0, width, width / 2))
			return;
	}

	const scale = computeSkinScale(width);
	const clearArea = (x: number, y: number, w: number, h: number): void => {
		const imageData = context.getImageData(x * scale, y * scale, w * scale, h * scale);
		const data = imageData.data;
		for (let i = 0; i < data.length; i += 4) {
			if (data[i + 3] < 255) {
				data[i] = 0;
				data[i + 1] = 0;
				data[i + 2] = 0;
				data[i + 3] = 0;
			}
		}
		context.putImageData(imageData, x * scale, y * scale);
	};

	if (!allowTransparency) {
		clearArea(0, 0, width, width);
	}

	// Clear areas for layer 2
	clearArea(40, 0, 8, 8); // Head Layer 2
	clearArea(0, 32, 8, 8); // Body Layer 2
	clearArea(16, 32, 8, 8); // Right Arm Layer 2
	clearArea(32, 32, 8, 8); // Left Arm Layer 2
	clearArea(0, 48, 4, 4); // Right Leg Layer 2 Top
	clearArea(4, 48, 4, 4); // Right Leg Layer 2 Bottom
	clearArea(0, 52, 4, 12); // Right Leg Layer 2 Right
	clearArea(4, 52, 4, 12); // Right Leg Layer 2 Front
	clearArea(8, 52, 4, 12); // Right Leg Layer 2 Left
	clearArea(12, 52, 4, 12); // Right Leg Layer 2 Back
	clearArea(52, 36, 12, 12); // Right Arm Layer 2 Back
	clearArea(4, 48, 4, 4); // Left Leg Layer 2 Top
	clearArea(8, 48, 4, 4); // Left Leg Layer 2 Bottom
	clearArea(0, 52, 4, 12); // Left Leg Layer 2 Right
	clearArea(4, 52, 4, 12); // Left Leg Layer 2 Front
	clearArea(8, 52, 4, 12); // Left Leg Layer 2 Left
	clearArea(12, 52, 4, 12); // Left Leg Layer 2 Back
	clearArea(52, 48, 4, 4); // Left Arm Layer 2 Top
	clearArea(56, 48, 4, 4); // Left Arm Layer 2 Bottom
	clearArea(48, 52, 4, 12); // Left Arm Layer 2 Right
	clearArea(52, 52, 4, 12); // Left Arm Layer 2 Front
	clearArea(56, 52, 4, 12); // Left Arm Layer 2 Left
	clearArea(60, 52, 4, 12); // Left Arm Layer 2 Back
}
