# skinpreview3d.js
A Three.js powered Minecraft skin viewer.

The code was originally created by [Kent Rasmussen](https://github.com/earthiverse). You can find out more about his project [here](https://github.com/earthiverse/3D-Minecraft-Skin-Viewer).

# Features
* 1.8 Skins
* HD Skins
* Capes
* Slim arms

# Dependencies
* [Three.js](https://github.com/mrdoob/three.js/)
* [jQuery](https://jquery.com/) (Optional)

# Usage
HTML
```html
<div id="skin_container"></div>
```

JS
```js
$(() => {
	$("#skin_container").skinPreview3D({
		skinUrl: 'img/hatsune_miku.png',
		capeUrl: 'img/cape.png',
		slim: true,
		width: 600,
		height: 600
	});
});
```

See `example_jquery.html` and `example_purejs.html` for more examples.
