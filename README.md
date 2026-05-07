skinview3d
========

[![CI Status](https://img.shields.io/github/actions/workflow/status/bs-community/skinview3d/ci.yaml?branch=master&label=CI&logo=github&style=flat-square)](https://github.com/bs-community/skinview3d/actions?query=workflow:CI)
[![NPM Package](https://img.shields.io/npm/v/skinview3d.svg?style=flat-square)](https://www.npmjs.com/package/skinview3d)
[![MIT License](https://img.shields.io/badge/license-MIT-yellowgreen.svg?style=flat-square)](https://github.com/bs-community/skinview3d/blob/master/LICENSE)
[![Gitter Chat](https://img.shields.io/gitter/room/TechnologyAdvice/Stardust.svg?style=flat-square)](https://gitter.im/skinview3d/Lobby)

Three.js powered Minecraft skin viewer.

# Features
* 1.8 Skins
* HD Skins
* Capes
* Ears
* Elytras
* Slim Arms
  * Automatic model detection (Slim / Default)
* FXAA (fast approximate anti-aliasing)

# Usage
[Example of using skinview3d](https://skinview3d-demo.vercel.app)

[![CodeSandbox](https://img.shields.io/badge/Codesandbox-040404?style=for-the-badge&logo=codesandbox&logoColor=DBDBDB)](https://codesandbox.io/s/skinview3d-template-vdmuh4)

```html
<canvas id="skin_container"></canvas>
<script>
	let skinViewer = new skinview3d.SkinViewer({
		canvas: document.getElementById("skin_container"),
		width: 300,
		height: 400,
		skin: "img/skin.png"
	});

	// Change viewer size
	skinViewer.width = 600;
	skinViewer.height = 800;

	// Load another skin
	skinViewer.loadSkin("img/skin2.png");

	// Load a cape
	skinViewer.loadCape("img/cape.png");

	// Load an elytra (from a cape texture)
	skinViewer.loadCape("img/cape.png", { backEquipment: "elytra" });

	// Unload (hide) the cape / elytra
	skinViewer.loadCape(null);

	// Load armors
	skinViewer.loadArmors(
  	"img/turtle_layer_1.png",   // helmet (main)
 	 "img/diamond_layer_1.png",  // chestplate (main)
  	"img/gold_layer_2.png",     // leggings (legs)
 	 "img/iron_layer_1.png"      // boots (main)
	);

	// Unload (hide) the armors
	skinViewer.loadArmors(null);

	// Set the background color
	skinViewer.background = 0x5a76f3;

	// Set the background to a normal image
	skinViewer.loadBackground("img/background.png");

	// Set the background to a panoramic image
	skinViewer.loadPanorama("img/panorama1.png");

	// Change camera FOV
	skinViewer.fov = 70;

	// Zoom out
	skinViewer.zoom = 0.5;

	// Rotate the player
	skinViewer.autoRotate = true;

	// Apply an animation
	skinViewer.animation = new skinview3d.WalkingAnimation();

	// Set the speed of the animation
	skinViewer.animation.speed = 3;

	// Pause the animation
	skinViewer.animation.paused = true;

	// Remove the animation
	skinViewer.animation = null;
</script>
```

## Lighting
By default, there are two lights on the scene. One is an ambient light, and the other is a point light from the camera.

To change the light intensity:
```js
skinViewer.cameraLight.intensity = 0.6;
skinViewer.globalLight.intensity = 3;
```

Setting `globalLight.intensity` to `3.0` and `cameraLight.intensity` to `0.0`
will completely disable shadows.


## Armors

skinview3d supports loading armor textures for the player. Armor textures can be specified as an object with the following optional properties:

- `helmet`, `chestplate`, `leggings`, `boots`: textures for the corresponding pieces.
- `main`: a texture that will be used for helmet, chestplate, and boots if their specific textures are not provided.
- `legs`: a texture that will be used for leggings if `leggings` is not provided.

Each texture can be a `RemoteImage` (URL string), a `TextureSource` (HTML image element or canvas), or `null` to hide that piece.

### Loading Armors

You can load armors using the `loadArmors` method. It accepts an object conforming to the structure above, or `null` to hide all armor.

Examples:

```js
// Hide all armor
skinViewer.loadArmors(null);

// Equip only helmet, chestplate, and boots using the same "main" texture
skinViewer.loadArmors({ main: "img/diamond_layer_1.png" });

// Equip only leggings using a "legs" texture
skinViewer.loadArmors({ legs: "img/diamond_layer_2.png" });

// Equip both main and legs textures
skinViewer.loadArmors({
  main: "img/diamond_layer_1.png",
  legs: "img/diamond_layer_2.png"
});

// Equip all four pieces individually (helmet, chestplate, leggings, boots)
skinViewer.loadArmors({
  helmet: "img/turtle_layer_1.png",
  chestplate: "img/diamond_layer_1.png",
  leggings: "img/gold_layer_2.png",
  boots: "img/iron_layer_1.png"
});

// Mix specific pieces with fallback textures
skinViewer.loadArmors({
  helmet: "img/turtle_layer_1.png",
  main: "img/diamond_layer_1.png", // used for chestplate and boots
  leggings: "img/gold_layer_2.png"
});
```

### Using Armors in the Constructor

You can specify armors directly in the `SkinViewer` options via the `armors` property. It accepts the same object format as `loadArmors`.

```js
new skinview3d.SkinViewer({
  skin: "img/skin.png",
  armors: {
    helmet: "img/turtle_layer_1.png",
    chestplate: "img/diamond_layer_1.png",
    leggings: "img/gold_layer_2.png",
    boots: "img/iron_layer_1.png"
  }
});
```

### Loading Armors Together with a Skin

The `loadSkin` method also accepts an `armors` option, which behaves identically to the constructor option.

```js
skinViewer.loadSkin("img/skin.png", {
  armors: {
    main: "img/diamond_layer_1.png",
    legs: "img/diamond_layer_2.png"
  }
});
```

## Ears
skinview3d supports two types of ear texture:
* `standalone`: 14x7 image that contains the ear ([example](https://github.com/bs-community/skinview3d/blob/master/examples/public/img/ears.png))
* `skin`: Skin texture that contains the ear (e.g. [deadmau5's skin](https://minecraft.wiki/w/Easter_eggs#deadmau5's_ears))

Usage:
```js
// You can specify ears in the constructor:
new skinview3d.SkinViewer({
	skin: "img/deadmau5.png",

	// Use ears drawn on the current skin (img/deadmau5.png)
	ears: "current-skin",

	// Or use ears from other textures
	ears: {
		textureType: "standalone", // "standalone" or "skin"
		source: "img/ears.png"
	}
});

// Show ears when loading skins:
skinViewer.loadSkin("img/deadmau5.png", { ears: true });

// Use ears from other textures:
skinViewer.loadEars("img/ears.png", { textureType: "standalone" });
skinViewer.loadEars("img/deadmau5.png", { textureType: "skin" });
```

## Name Tag
Usage:
```js
// Name tag with text "hello"
skinViewer.nameTag = "hello";

// Specify the text color
skinViewer.nameTag = new skinview3d.NameTagObject("hello", { textStyle: "yellow" });

// Unset the name tag
skinViewer.nameTag = null;
```

In order to display name tags correctly, you need the `Minecraft` font from
[South-Paw/typeface-minecraft](https://github.com/South-Paw/typeface-minecraft).
This font is available at [`assets/minecraft.woff2`](assets/minecraft.woff2).

To load this font, please add the `@font-face` rule to your CSS:
```css
@font-face {
	font-family: 'Minecraft';
	src: url('/path/to/minecraft.woff2') format('woff2');
}
```

# Build
`npm run build`
