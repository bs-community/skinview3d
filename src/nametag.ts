import { CanvasTexture, NearestFilter, Sprite, SpriteMaterial } from "three";

export interface NameTagOptions {
	/**
	 * A font specification using the CSS value syntax.
	 *
	 * The default value uses `Minecraft` font from
	 * {@link https://github.com/South-Paw/typeface-minecraft | South-Paw/typeface-minecraft},
	 * which is available at `skinview3d/assets/minecraft.woff2`.
	 *
	 * In order to use this font, please add the `@font-face` rule to your CSS:
	 * ```css
	 * ＠font-face {
	 *   font-family: 'Minecraft';
	 *   src: url('/path/to/minecraft.woff2') format('woff2');
	 * }
	 * ```
	 * Remember to replace the font URL based on your situation.
	 *
	 * @defaultValue `"48px Minecraft"`
	 */
	font?: string;

	/**
	 * Whether to repaint the name tag after the desired font is loaded.
	 *
	 * The font specified in `font` option may not be available when a {@link NameTagObject} is created,
	 * especially when you are using a web font. In this case, a fallback font will be used.
	 *
	 * If `repaintAfterLoaded` is `true`, the name tag is repainted after the desired font is loaded.
	 * This process can be monitored using {@link NameTagObject.painted}.
	 *
	 * @defaultValue `true`
	 */
	repaintAfterLoaded?: boolean;

	/**
	 * The space (in pixels) between the text and the border of the name tag.
	 *
	 * Order: **top**, **right**, **bottom**, **left** (clockwise).
	 *
	 * @defaultValue `[5, 10, 5, 10]`
	 */
	margin?: [number, number, number, number];

	/**
	 * The color, gradient, or pattern used to draw the text.
	 *
	 * @defaultValue `"white"`
	 */
	textStyle?: string | CanvasGradient | CanvasPattern;

	/**
	 * The color, gradient, or pattern used to draw the background.
	 *
	 * @defaultValue `"rgba(0,0,0,.25)"`
	 */
	backgroundStyle?: string | CanvasGradient | CanvasPattern;

	/**
	 * The height of the name tag object.
	 *
	 * @defaultValue `4.0`
	 */
	height?: number;
}

/**
 * A Minecraft name tag, i.e. a text label with background.
 */
export class NameTagObject extends Sprite {
	/**
	 * A promise that is resolved after the name tag is fully painted.
	 *
	 * This will be a resolved promise, if
	 * {@link NameTagOptions.repaintAfterLoaded} is `false`, or
	 * the desired font is available when the `NameTagObject` is created.
	 *
	 * If {@link NameTagOptions.repaintAfterLoaded} is `true`, and
	 * the desired font hasn't been loaded when the `NameTagObject` is created,
	 * the name tag will be painted with the fallback font first, and then
	 * repainted with the desired font after it's loaded. This promise is
	 * resolved after repainting is done.
	 */
	readonly painted: Promise<void>;

	private text: string;
	private font: string;
	private margin: [number, number, number, number];
	private textStyle: string | CanvasGradient | CanvasPattern;
	private backgroundStyle: string | CanvasGradient | CanvasPattern;
	private height: number;
	private textMaterial: SpriteMaterial;

	constructor(text: string = "", options: NameTagOptions = {}) {
		const material = new SpriteMaterial({
			transparent: true,
			alphaTest: 1e-5,
		});

		super(material);

		this.textMaterial = material;

		this.text = text;
		this.font = options.font === undefined ? "48px Minecraft" : options.font;
		this.margin = options.margin === undefined ? [5, 10, 5, 10] : options.margin;
		this.textStyle = options.textStyle === undefined ? "white" : options.textStyle;
		this.backgroundStyle = options.backgroundStyle === undefined ? "rgba(0,0,0,.25)" : options.backgroundStyle;
		this.height = options.height === undefined ? 4.0 : options.height;

		const repaintAfterLoaded = options.repaintAfterLoaded === undefined ? true : options.repaintAfterLoaded;
		if (repaintAfterLoaded && !document.fonts.check(this.font, this.text)) {
			this.paint();
			this.painted = this.loadAndPaint();
		} else {
			this.paint();
			this.painted = Promise.resolve();
		}
	}

	private async loadAndPaint() {
		await document.fonts.load(this.font, this.text);
		this.paint();
	}

	private paint() {
		const canvas = document.createElement("canvas");

		// Measure the text size
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		let ctx = canvas.getContext("2d")!;
		ctx.font = this.font;
		const metrics = ctx.measureText(this.text);

		// Compute canvas size
		canvas.width = this.margin[3] + metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight + this.margin[1];
		canvas.height =
			this.margin[0] + metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + this.margin[2];

		// After change canvas size, the context needs to be re-created
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		ctx = canvas.getContext("2d")!;
		ctx.font = this.font;

		// Fill background
		ctx.fillStyle = this.backgroundStyle;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Draw text
		ctx.fillStyle = this.textStyle;
		ctx.fillText(
			this.text,
			this.margin[3] + metrics.actualBoundingBoxLeft,
			this.margin[0] + metrics.actualBoundingBoxAscent
		);

		// Apply texture
		const texture = new CanvasTexture(canvas);
		texture.magFilter = NearestFilter;
		texture.minFilter = NearestFilter;
		this.textMaterial.map = texture;
		this.textMaterial.needsUpdate = true;

		// Update size
		this.scale.x = (canvas.width / canvas.height) * this.height;
		this.scale.y = this.height;
	}
}
