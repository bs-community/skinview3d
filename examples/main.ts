import * as skinview3d from "../src/skinview3d";
import "./style.css";

const skinParts = ["head", "body", "rightArm", "leftArm", "rightLeg", "leftLeg"];
const skinLayers = ["innerLayer", "outerLayer"];
const availableAnimations = {
	idle: new skinview3d.IdleAnimation(),
	walk: new skinview3d.WalkingAnimation(),
	run: new skinview3d.RunningAnimation(),
	fly: new skinview3d.FlyingAnimation(),
	wave: new skinview3d.WaveAnimation(),
};

let skinViewer: skinview3d.SkinViewer;

function obtainTextureUrl(id: string) {
	const urlInput = document.getElementById(id);
	const fileInput = document.getElementById(id + "_upload");
	const unsetButton = document.getElementById(id + "_unset");
	const file = fileInput.files[0];
	if (file === undefined) {
		if (!unsetButton.classList.contains("hidden")) {
			unsetButton.classList.add("hidden");
		}
		return urlInput.value;
	} else {
		unsetButton.classList.remove("hidden");
		urlInput.value = `Local file: ${file.name}`;
		urlInput.readOnly = true;
		return URL.createObjectURL(file);
	}
}

function reloadSkin() {
	const input = document.getElementById("skin_url");
	const url = obtainTextureUrl("skin_url");
	if (url === "") {
		skinViewer.loadSkin(null);
		input.setCustomValidity("");
	} else {
		skinViewer
			.loadSkin(url, {
				model: document.getElementById("skin_model").value,
				ears: document.getElementById("ears_source").value === "current_skin",
			})
			.then(() => input.setCustomValidity(""))
			.catch(e => {
				input.setCustomValidity("Image can't be loaded.");
				console.error(e);
			});
	}
}

function reloadCape() {
	const input = document.getElementById("cape_url");
	const url = obtainTextureUrl("cape_url");
	if (url === "") {
		skinViewer.loadCape(null);
		input.setCustomValidity("");
	} else {
		const selectedBackEquipment = document.querySelector('input[type="radio"][name="back_equipment"]:checked');
		skinViewer
			.loadCape(url, { backEquipment: selectedBackEquipment.value })
			.then(() => input.setCustomValidity(""))
			.catch(e => {
				input.setCustomValidity("Image can't be loaded.");
				console.error(e);
			});
	}
}

function reloadEars(skipSkinReload = false) {
	const sourceType = document.getElementById("ears_source").value;
	let hideInput = true;
	if (sourceType === "none") {
		skinViewer.loadEars(null);
	} else if (sourceType === "current_skin") {
		if (!skipSkinReload) {
			reloadSkin();
		}
	} else {
		hideInput = false;
		document.querySelectorAll("#default_ears option[data-texture-type]").forEach(opt => {
			opt.disabled = opt.dataset.textureType !== sourceType;
		});

		const input = document.getElementById("ears_url");
		const url = obtainTextureUrl("ears_url");
		if (url === "") {
			skinViewer.loadEars(null);
			input.setCustomValidity("");
		} else {
			skinViewer
				.loadEars(url, { textureType: sourceType })
				.then(() => input.setCustomValidity(""))
				.catch(e => {
					input.setCustomValidity("Image can't be loaded.");
					console.error(e);
				});
		}
	}

	const el = document.getElementById("ears_texture_input");
	if (hideInput) {
		if (!el.classList.contains("hidden")) {
			el.classList.add("hidden");
		}
	} else {
		el.classList.remove("hidden");
	}
}

function reloadPanorama() {
	const input = document.getElementById("panorama_url");
	const url = obtainTextureUrl("panorama_url");
	if (url === "") {
		skinViewer.background = null;
		input.setCustomValidity("");
	} else {
		skinViewer
			.loadPanorama(url)
			.then(() => input.setCustomValidity(""))
			.catch(e => {
				input.setCustomValidity("Image can't be loaded.");
				console.error(e);
			});
	}
}

function reloadNameTag() {
	const text = document.getElementById("nametag_text").value;
	if (text === "") {
		skinViewer.nameTag = null;
	} else {
		skinViewer.nameTag = text;
	}
}

function initializeControls() {
	document.getElementById("canvas_width").addEventListener("change", e => (skinViewer.width = e.target.value));
	document.getElementById("canvas_height").addEventListener("change", e => (skinViewer.height = e.target.value));
	document.getElementById("fov").addEventListener("change", e => (skinViewer.fov = e.target.value));
	document.getElementById("zoom").addEventListener("change", e => (skinViewer.zoom = e.target.value));
	document
		.getElementById("global_light")
		.addEventListener("change", e => (skinViewer.globalLight.intensity = e.target.value));
	document
		.getElementById("camera_light")
		.addEventListener("change", e => (skinViewer.cameraLight.intensity = e.target.value));
	document
		.getElementById("animation_pause_resume")
		.addEventListener("click", () => (skinViewer.animation.paused = !skinViewer.animation.paused));
	document.getElementById("auto_rotate").addEventListener("change", e => (skinViewer.autoRotate = e.target.checked));
	document
		.getElementById("auto_rotate_speed")
		.addEventListener("change", e => (skinViewer.autoRotateSpeed = e.target.value));
	for (const el of document.querySelectorAll('input[type="radio"][name="animation"]')) {
		el.addEventListener("change", e => {
			if (e.target.value === "") {
				skinViewer.animation = null;
			} else {
				skinViewer.animation = availableAnimations[e.target.value];
				skinViewer.animation.speed = document.getElementById("animation_speed").value;
			}
		});
	}
	document.getElementById("animation_speed").addEventListener("change", e => {
		if (skinViewer.animation !== null) {
			skinViewer.animation.speed = e.target.value;
		}
	});
	document
		.getElementById("control_rotate")
		.addEventListener("change", e => (skinViewer.controls.enableRotate = e.target.checked));
	document
		.getElementById("control_zoom")
		.addEventListener("change", e => (skinViewer.controls.enableZoom = e.target.checked));
	document
		.getElementById("control_pan")
		.addEventListener("change", e => (skinViewer.controls.enablePan = e.target.checked));
	for (const part of skinParts) {
		for (const layer of skinLayers) {
			document
				.querySelector(`#layers_table input[type="checkbox"][data-part="${part}"][data-layer="${layer}"]`)
				.addEventListener("change", e => (skinViewer.playerObject.skin[part][layer].visible = e.target.checked));
		}
	}

	const initializeUploadButton = (id, callback) => {
		const urlInput = document.getElementById(id);
		const fileInput = document.getElementById(id + "_upload");
		const unsetButton = document.getElementById(id + "_unset");
		const unsetAction = () => {
			urlInput.readOnly = false;
			urlInput.value = "";
			fileInput.value = fileInput.defaultValue;
			callback();
		};
		fileInput.addEventListener("change", e => callback());
		urlInput.addEventListener("keydown", e => {
			if (e.key === "Backspace" && urlInput.readOnly) {
				unsetAction();
			}
		});
		unsetButton.addEventListener("click", e => unsetAction());
	};
	initializeUploadButton("skin_url", reloadSkin);
	initializeUploadButton("cape_url", reloadCape);
	initializeUploadButton("ears_url", reloadEars);
	initializeUploadButton("panorama_url", reloadPanorama);

	document.getElementById("skin_url").addEventListener("change", () => reloadSkin());
	document.getElementById("skin_model").addEventListener("change", () => reloadSkin());
	document.getElementById("cape_url").addEventListener("change", () => reloadCape());
	document.getElementById("ears_source").addEventListener("change", () => reloadEars());
	document.getElementById("ears_url").addEventListener("change", () => reloadEars());
	document.getElementById("panorama_url").addEventListener("change", () => reloadPanorama());

	for (const el of document.querySelectorAll('input[type="radio"][name="back_equipment"]')) {
		el.addEventListener("change", e => {
			if (skinViewer.playerObject.backEquipment === null) {
				// cape texture hasn't been loaded yet
				// this option will be processed on texture loading
			} else {
				skinViewer.playerObject.backEquipment = e.target.value;
			}
		});
	}

	document.getElementById("reset_all").addEventListener("click", () => {
		skinViewer.dispose();
		initializeViewer();
	});

	document.getElementById("nametag_text").addEventListener("change", () => reloadNameTag());
}

function initializeViewer() {
	skinViewer = new skinview3d.SkinViewer({
		canvas: document.getElementById("skin_container"),
	});

	skinViewer.width = document.getElementById("canvas_width").value;
	skinViewer.height = document.getElementById("canvas_height").value;
	skinViewer.fov = document.getElementById("fov").value;
	skinViewer.zoom = document.getElementById("zoom").value;
	skinViewer.globalLight.intensity = document.getElementById("global_light").value;
	skinViewer.cameraLight.intensity = document.getElementById("camera_light").value;
	skinViewer.autoRotate = document.getElementById("auto_rotate").checked;
	skinViewer.autoRotateSpeed = document.getElementById("auto_rotate_speed").value;
	const animationName = document.querySelector('input[type="radio"][name="animation"]:checked').value;
	if (animationName !== "") {
		skinViewer.animation = availableAnimations[animationName];
		skinViewer.animation.speed = document.getElementById("animation_speed").value;
	}
	skinViewer.controls.enableRotate = document.getElementById("control_rotate").checked;
	skinViewer.controls.enableZoom = document.getElementById("control_zoom").checked;
	skinViewer.controls.enablePan = document.getElementById("control_pan").checked;
	for (const part of skinParts) {
		for (const layer of skinLayers) {
			skinViewer.playerObject.skin[part][layer].visible = document.querySelector(
				`#layers_table input[type="checkbox"][data-part="${part}"][data-layer="${layer}"]`
			).checked;
		}
	}
	reloadSkin();
	reloadCape();
	reloadEars(true);
	reloadPanorama();
	reloadNameTag();
}

initializeControls();
initializeViewer();
