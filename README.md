skinview3d
========

[![Travis](https://img.shields.io/travis/to2mbn/skinview3d.svg?style=flat-square)](https://travis-ci.org/to2mbn/skinview3d)
[![npm](https://img.shields.io/npm/v/skinview3d.svg?style=flat-square)](https://www.npmjs.com/package/skinview3d)
[![license](https://img.shields.io/github/license/to2mbn/skinview3d.svg?style=flat-square)](https://github.com/to2mbn/skinview3d/blob/master/LICENSE)

Three.js powered Minecraft skin viewer.

# Features
* 1.8 Skins
* HD Skins
* Capes
* Slim arms

# Usage
```html
<div id="skin_container"></div>
<script>
	let skinViewer = new skinview3d.SkinViewer({
		domElement: document.getElementById("skin_container"),
		slim: true,
		width: 600,
		height: 600,
		skinUrl: "img/skin.png",
		capeUrl: "img/cape.png",
		animation: skinview3d.WalkAnimation
	});

	// change the skin and cape
	// skinViewer.skinUrl = "img/skin.png";
	// skinViewer.capeUrl = "img/cape.png";

	// change the width and height
	// skinViewer.width = 300;
	// skinViewer.height = 400;

	// enable the mouse control feature
	let control = new skinview3d.SkinControl(skinViewer);

	// pause the animation
	// skinViewer.animationPaused = true;

	// change the animation speed
	// skinViewer.animationSpeed = 8;

	// disable the 'right click to play/pause' feature
	// control.enableAnimationControl = false;
</script>
```

# Build
`npm run build`
