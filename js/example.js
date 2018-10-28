// Use pure ES5 for max browser compatibility

var skinViewer, control, handles = {}, globalAnimationSpeed = 1;

var skinParts = {}

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
		width: el('width').value,
		height: el('height').value,
		skinUrl: el('skin_url').value,
		capeUrl: el('cape_url').value || null
	});

	skinViewer.camera.position.z = 70;
	skinViewer.animation = new skinview3d.CompositeAnimation();

	control = skinview3d.createOrbitControls(skinViewer);

	var parts = skinViewer.playerObject.skin;

	// set inner parts
	skinParts.head = parts.head.innerLayer;
	skinParts.body = parts.body.innerLayer;
	skinParts.leftArm = parts.leftArm.innerLayer;
	skinParts.rightArm = parts.rightArm.innerLayer;
	skinParts.leftLeg = parts.leftLeg.innerLayer;
	skinParts.rightLeg = parts.rightLeg.innerLayer;

	// set outter parts
	skinParts.head2 = parts.head.outerLayer;
	skinParts.body2 = parts.body.outerLayer;
	skinParts.leftArm2 = parts.leftArm.outerLayer;
	skinParts.rightArm2 = parts.rightArm.outerLayer;
	skinParts.leftLeg2 = parts.leftLeg.outerLayer;
	skinParts.rightLeg2 = parts.rightLeg.outerLayer;

}

function hotReloadTextures() {
	var capeObject = skinViewer.playerObject.cape;
	var capeUrl = el('cape_url').value;
	var skinUrl = el('skin_url').value;

	// I've noted there is not a good way to set the cape to null
	// so we hide it as work around but need to raise an issue
	if (capeUrl === "") {
		capeObject.visible = false;
	} else {
		skinViewer.capeUrl = capeUrl;
	}

	skinViewer.skinUrl = skinUrl;
}

function resizeSkinViewer() {
	skinViewer.width = el('width').value;
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

function togglePart(partName) {
	skinParts[partName].visible = !skinParts[partName].visible;
}

function setGlobalAnimationSpeed() {
	var currentSpeed = el('speed').value;

	if (!isNaN(currentSpeed)) {
		globalAnimationSpeed = currentSpeed;

		for (var key in handles) {
			handles[key].speed = currentSpeed;
		}
	}
}
