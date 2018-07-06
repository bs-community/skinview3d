// Use pure ES5 for max browser compatibility

var skinViewer, control, handles = {}, globalAnimationSpeed = 1;

function el(id) {
    return document.getElementById(id);
}

function initSkinViewer() {
    if (skinViewer instanceof skinview3d.SkinViewer) {
        skinViewer.dispose();
        handles = {};
        control = undefined;
    }

    // Reset animation speed
    el('speed').value = globalAnimationSpeed = 1;

    skinViewer = new skinview3d.SkinViewer({
        domElement: el("skin_container"),
        width:      el('width').value,
        height:     el('height').value,
        skinUrl:    el('skin_url').value,
        capeUrl:    el('cape_url').value
    });

    skinViewer.camera.position.z = 70;
    skinViewer.animation = new skinview3d.CompositeAnimation();

    control = skinview3d.createOrbitControls(skinViewer);
}

function hotReloadTextures() {
    skinViewer.skinUrl = el('skin_url').value;
    skinViewer.capeUrl = el('cape_url').value;
}

function resizeSkinViewer() {
    skinViewer.width  = el('width').value;
    skinViewer.height = el('height').value;
}

function pause() {
    skinViewer.animationPaused = !skinViewer.animationPaused;
}

function walk() {
    if (handles.run) {
        handles.run.remove();
        delete handles.run;
    }

    handles.walk = handles.walk || skinViewer.animation.add(skinview3d.WalkingAnimation);
    handles.walk.speed = globalAnimationSpeed;
}

function run() {
    if (handles.walk) {
        handles.walk.remove();
        delete handles.walk;
    }

    handles.run = handles.run || skinViewer.animation.add(skinview3d.RunningAnimation);
    handles.run.speed = globalAnimationSpeed;
}

function rotate() {
    if (handles.rotate) {
        handles.rotate.paused = !handles.rotate.paused;
    } else {
        handles.rotate = skinViewer.animation.add(skinview3d.RotatingAnimation);
        handles.rotate.speed = globalAnimationSpeed;
    }
}

function setGlobalAnimationSpeed() {
    var currentSpeed = el('speed').value;

    if (! isNaN(currentSpeed)) {
        globalAnimationSpeed = currentSpeed;

        for (var key in handles) {
            handles[key].speed = currentSpeed;
        }
    }
}
