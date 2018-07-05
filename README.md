skinview3d
========

[![Travis](https://img.shields.io/travis/bs-community/skinview3d.svg?style=flat-square)](https://travis-ci.org/bs-community/skinview3d)
[![npm](https://img.shields.io/npm/v/skinview3d.svg?style=flat-square)](https://www.npmjs.com/package/skinview3d)
[![license](https://img.shields.io/badge/license-MIT-yellowgreen.svg?style=flat-square)](https://github.com/bs-community/skinview3d/blob/master/LICENSE)
[![Gitter chat](https://img.shields.io/gitter/room/TechnologyAdvice/Stardust.svg?style=flat-square)](https://gitter.im/skinview3d/Lobby)

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

	skinViewer.animation = new skinview3d.CompositeAnimation();

	// Add an animation
	let walk = skinViewer.animation.add(skinview3d.WalkingAnimation);
	// Add another animation
	let rotate = skinViewer.animation.add(skinview3d.RotatingAnimation);
	// Remove an animation, stop walking dude
	walk.remove();
	// And run for now!
	let run = skinViewer.animation.add(skinview3d.RunningAnimation);

	// Set the speed of an animation
	run.speed = 3;
	// Pause single animation
	run.paused = true;
	// Pause all animations!
	skinViewer.animationPaused = true;
</script>
```

# Build
`npm run build`
