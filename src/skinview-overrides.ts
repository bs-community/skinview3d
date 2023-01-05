
import { TextureCanvas, TextureSource } from "skinview-utils";

function computeCapeScale(image: TextureSource): number {
	if (image.width === 2 * image.height) {
		// 64x32
		return image.width / 64;
	} else if (image.width * 17 === image.height * 22) {
		// 22x17
		return image.width / 22;
	} else if (image.width * 11 === image.height * 23) {
		// 46x22
		return image.width / 46;
    } else if ((image.height % (image.width / 2)) == 0) {
		//Animated cape HD with raito 64x32
		return image.width / 64
	} else {
		throw new Error(`Bad cape size: ${image.width}x${image.height}`);
	}
}

export function loadCapeToCanvas(canvas: HTMLCanvasElement, image: TextureSource, frame: number): void {
	const scale = computeCapeScale(image);
	canvas.width = 64 * scale;
	canvas.height = 32 * scale;

	const frameWidth = image.width;
	const frameHeight = image.width / 2;
	const frameOffset = frameHeight * (frame - 1);

	const context = canvas.getContext("2d")!;
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.drawImage(image, 0, frameOffset, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight)
}