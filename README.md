# skinpreview3d.js
This is a Three.js powered Minecraft skin renderer packaged as a jQuery plugin.

The code was originally created by [Kent Rasmussen](https://github.com/earthiverse). You can find out more about his project [here](https://github.com/earthiverse/3D-Minecraft-Skin-Viewer).

[Github pages example](http://hacksore.github.io/skinpreview3d.js)

# Features
* 1.8 Skins
* Capes

# Dependencies
* [Three.js](https://github.com/mrdoob/three.js/)
* [jQuery](https://jquery.com/)

# Usage
HTML
```html
<div id="canvas_container">
    <canvas id="canvas" width="64" height="64"></canvas>
</div>
```

JS
```js
$(function() {
    $("#canvas_container").skinPreview3D({
        imageUrl: "/img/ref.png",
        canvasID: "canvas"
    });
});
```

# Todo
* Create a demo hosted on github pages.
* Alex support (Slim arms).
* Mouse wheel camera zoom.
