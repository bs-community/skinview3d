# skinpreview3d.js
This is a Three.js powered Minecraft skin renderer packaged as a jQuery plugin.

The code was originally created by [Kent Rasmussen](https://github.com/earthiverse). You can find out more about his project [here](https://github.com/earthiverse/3D-Minecraft-Skin-Viewer).

# Features
* 1.8 Skins
* Capes
* Slim arms

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
		skinUrl: 'img/hatsune_miku.png',
		capeUrl: 'img/cape.png',
		slim: true,
		width: 600,
		height: 600
	});
});
```

# License
* `/img/mojang_cape.png` Copyright Mojang AB. [Link](https://minecraft.gamepedia.com/File:MojangCape2016.png)
* `/img/hatsune_miku.png` Copyright xilefian. [Link](http://www.minecraftforum.net/forums/mapping-and-modding/skins/2646900-hatsune-miku-skin-1-9-transparency-layers)
* `/img/1_8_texturemap_redux.png` Copyright Mojang AB. [Link](https://minecraft.gamepedia.com/File:1_8_texturemap_redux.png)

Other parts of the repository are licensed under GPLv3 License.
