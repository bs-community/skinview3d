const DEFAULT_ELYTRA_WIDTH = 64;
const DEFAULT_ELYTRA_HEIGHT = 32;

// Elytra UV bounds in 64x32 cape space: setCapeUVs(box, 22, 0, 10, 20, 2)
const ELYTRA_U = 22;
const ELYTRA_V = 0;
const ELYTRA_BOX_WIDTH = 10;
const ELYTRA_BOX_HEIGHT = 20;
const ELYTRA_BOX_DEPTH = 2;

const ELYTRA_REGION_WIDTH = ELYTRA_BOX_WIDTH * 2 + ELYTRA_BOX_DEPTH * 2; // 24
const ELYTRA_REGION_HEIGHT = ELYTRA_BOX_HEIGHT + ELYTRA_BOX_DEPTH; // 22

// Original neutral slate-grey wing pattern (10x20) in back-face coordinates:
// column 0 is the inner spine edge, column 9 is the outer wing edge.
// "." is transparent so the box forms a clean tapered wing silhouette.
const WING_BACK_PATTERN: readonly string[] = [
	"######....",
	"#mllmm#...",
	"#mllmmm#..",
	"#mlmmmm#..",
	"#mlmmmmd#.",
	"#mmmmmmdd#",
	"#mmmmmmdd#",
	"#mmmlmmdd#",
	"#mmlmmmdd#",
	"#mlmmmddd#",
	"#mlmmmddd#",
	"#lmmmmddd#",
	"#lmmmdddd#",
	"#mmmmdddd#",
	".#mmmdddd#",
	".#mmddddd#",
	".#mmdddd#.",
	"..#mdddd#.",
	"..#dddd#..",
	"...#####..",
];

const WING_PALETTE: Record<string, string> = {
	"#": "#565a66",
	d: "#6d7280",
	m: "#8b92a1",
	l: "#adb4c4",
};

/**
 * Creates a 64x32 canvas containing a procedural default elytra texture
 * mapped to the standard elytra UV coordinates `(22, 0, 10, 20, 2)`.
 */
export function createDefaultElytraCanvas(): HTMLCanvasElement {
	const canvas = document.createElement("canvas");
	canvas.width = DEFAULT_ELYTRA_WIDTH;
	canvas.height = DEFAULT_ELYTRA_HEIGHT;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		return canvas;
	}

	const drawFace = (originX: number, originY: number, mirrorX: boolean): void => {
		for (let y = 0; y < WING_BACK_PATTERN.length; y++) {
			const row = WING_BACK_PATTERN[y];
			for (let x = 0; x < row.length; x++) {
				const color = WING_PALETTE[row[x]];
				if (!color) {
					continue;
				}
				const px = mirrorX ? originX + (ELYTRA_BOX_WIDTH - 1 - x) : originX + x;
				ctx.fillStyle = color;
				ctx.fillRect(px, originY + y, 1, 1);
			}
		}
	};

	const frontX = ELYTRA_U + ELYTRA_BOX_DEPTH; // 24..33
	const rightX = frontX + ELYTRA_BOX_WIDTH; // 34..35 (inner spine edge)
	const backX = rightX + ELYTRA_BOX_DEPTH; // 36..45
	const bodyY = ELYTRA_V + ELYTRA_BOX_DEPTH; // 2..21

	// Back face (outer side of wing) and mirrored front face (inner side)
	drawFace(backX, bodyY, false);
	drawFace(frontX, bodyY, true);

	// Flush edge caps matching the non-transparent rows/columns of the wing silhouette
	ctx.fillStyle = "#565a66";
	// Top edge (shoulder): 6 columns matching row 0 ("######....")
	ctx.fillRect(frontX + 4, ELYTRA_V, 6, ELYTRA_BOX_DEPTH);
	// Bottom edge (wingtip): 5 columns matching row 19 ("...#####..")
	ctx.fillRect(rightX + 2, ELYTRA_V, 5, ELYTRA_BOX_DEPTH);
	// Upper side edge (rows 0..9 where col 0 is solid, stopping before the lower curve)
	ctx.fillRect(rightX, bodyY, ELYTRA_BOX_DEPTH, 10);
	// Lower outer edge (rows 5..15 where col 9 is solid)
	ctx.fillRect(ELYTRA_U, bodyY + 5, ELYTRA_BOX_DEPTH, 10);

	return canvas;
}

/**
 * Checks whether a normalized 64x32-proportioned cape canvas contains any opaque
 * pixels in the elytra UV region (`x: 22..46, y: 0..22`).
 */
export function hasElytraTexture(capeCanvas: HTMLCanvasElement): boolean {
	if (capeCanvas.width === 0 || capeCanvas.height === 0) {
		return false;
	}
	const ctx = capeCanvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) {
		return true;
	}

	const x0 = Math.floor((ELYTRA_U * capeCanvas.width) / DEFAULT_ELYTRA_WIDTH);
	const y0 = Math.floor((ELYTRA_V * capeCanvas.height) / DEFAULT_ELYTRA_HEIGHT);
	const w = Math.min(
		capeCanvas.width - x0,
		Math.ceil((ELYTRA_REGION_WIDTH * capeCanvas.width) / DEFAULT_ELYTRA_WIDTH)
	);
	const h = Math.min(
		capeCanvas.height - y0,
		Math.ceil((ELYTRA_REGION_HEIGHT * capeCanvas.height) / DEFAULT_ELYTRA_HEIGHT)
	);
	if (w <= 0 || h <= 0) {
		return false;
	}

	try {
		const { data } = ctx.getImageData(x0, y0, w, h);
		for (let i = 3; i < data.length; i += 4) {
			if (data[i] > 0) {
				return true;
			}
		}
		return false;
	} catch {
		// If the canvas is tainted by cross-origin image data, fall back to the cape texture.
		return true;
	}
}
