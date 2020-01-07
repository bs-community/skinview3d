skinview3d
========

[![CI Status](https://img.shields.io/github/workflow/status/bs-community/skinview3d/CI?label=CI&logo=github&style=flat-square)](https://github.com/bs-community/skinview3d/actions?query=workflow:CI)
[![NPM Package](https://img.shields.io/npm/v/skinview3d.svg?style=flat-square)](https://www.npmjs.com/package/skinview3d)
[![MIT License](https://img.shields.io/badge/license-MIT-yellowgreen.svg?style=flat-square)](https://github.com/bs-community/skinview3d/blob/master/LICENSE)
[![Gitter Chat](https://img.shields.io/gitter/room/TechnologyAdvice/Stardust.svg?style=flat-square)](https://gitter.im/skinview3d/Lobby)

Three.js powered Minecraft skin viewer.

# Features
* 1.8 Skins
* HD Skins
* Capes
* Slim Arms
  * Automatic model detection (Slim / Default)

# Usage
[Examples of using the viewer](https://bs-community.github.io/skinview3d/)
```html
<div id="skin_container"></div>
<script>
	let skinViewer = new skinview3d.SkinViewer({
		domElement: document.getElementById("skin_container"),
		width: 600,
		height: 600,
		skinUrl: "img/skin.png",
		capeUrl: "img/cape.png"
	});

	// Change the textures
	skinViewer.skinUrl = "img/skin2.png";
	skinViewer.capeUrl = "img/cape2.png";

	// Resize the skin viewer
	skinViewer.width = 300;
	skinViewer.height = 400;

	// Control objects with your mouse!
	let control = skinview3d.createOrbitControls(skinViewer);
	control.enableRotate = true;
	control.enableZoom = false;
	control.enablePan = false;

	// Add an animation
	let walk = skinViewer.animations.add(skinview3d.WalkingAnimation);
	// Add another animation
	let rotate = skinViewer.animations.add(skinview3d.RotatingAnimation);
	// Remove an animation, stop walking dude
	walk.remove();
	// Remove the rotating animation, and make the player face forward
	rotate.resetAndRemove();
	// And run for now!
	let run = skinViewer.animations.add(skinview3d.RunningAnimation);

	// Set the speed of an animation
	run.speed = 3;
	// Pause single animation
	run.paused = true;
	// Pause all animations!
	skinViewer.animations.paused = true;
</script>
```

# Build
`npm run build`
