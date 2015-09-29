# skinpreview3d.js
This is a Three.js powered Minecraft skin renderer packaged as a jQuery plugin.

The code was originally created by [Kent Rasmussen](https://github.com/earthiverse). You can find out more about his project [here](https://github.com/earthiverse/3D-Minecraft-Skin-Viewer).


# Usage
HTML
```
<div id="canvas_container">
    <canvas id="canvas" width="64" height="64"></canvas>
</div>
```

JS
```
$(function() {
    $("#canvas_container").skinPreview3D({
        imageUrl: "/img/ref.png",
        canvasID: "canvas"
    });
});
```

# Todo
* Create a demo hosted on github pages
