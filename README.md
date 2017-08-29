# skinpreview3d.js
This is a Three.js powered Minecraft skin renderer packaged as a jQuery plugin.

The code was originally created by [Kent Rasmussen](https://github.com/earthiverse). You can find out more about his project [here](https://github.com/earthiverse/3D-Minecraft-Skin-Viewer).

# Features
* 1.8 Skins
* Capes

# Dependencies
* [Three.js](https://github.com/mrdoob/three.js/)
* [jQuery](https://jquery.com/)

# Usage
HTML
```html
<div id="skin_container"></div>
```

JS
```js
$(() => {
	$("#skin_container").skinPreview3D({
		skinUrl: 'img/Dinnerbone.png',
		capeUrl: 'img/cape.png',
		width: 600,
		height: 600
	});
});
```

# TODOs
* Alex support (Slim arms).
