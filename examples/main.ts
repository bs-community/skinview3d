import * as skinview3d from "../src/skinview3d";
import type { ModelType } from "skinview-utils";
import type { BackEquipment } from "../src/model";
import "./style.css";

const skinParts = ["head", "body", "rightArm", "leftArm", "rightLeg", "leftLeg"];
const skinLayers = ["innerLayer", "outerLayer"];
const availableAnimations = {
	idle: new skinview3d.IdleAnimation(),
	walk: new skinview3d.WalkingAnimation(),
	run: new skinview3d.RunningAnimation(),
	fly: new skinview3d.FlyingAnimation(),
	wave: new skinview3d.WaveAnimation(),
	crouch: new skinview3d.CrouchAnimation(),
	hit: new skinview3d.HitAnimation(),
};

let skinViewer: skinview3d.SkinViewer;

function obtainTextureUrl(id: string): string {
	const urlInput = document.getElementById(id) as HTMLInputElement;
	const fileInput = document.getElementById(`${id}_upload`) as HTMLInputElement;
	const unsetButton = document.getElementById(`${id}_unset`);
	const file = fileInput?.files?.[0];

	if (!file) {
		if (unsetButton && !unsetButton.classList.contains("hidden")) {
			unsetButton.classList.add("hidden");
		}
		return urlInput?.value || "";
	}

	if (unsetButton) {
		unsetButton.classList.remove("hidden");
	}
	if (urlInput) {
		urlInput.value = `Local file: ${file.name}`;
		urlInput.readOnly = true;
	}
	return URL.createObjectURL(file);
}

function reloadSkin(): void {
	const input = document.getElementById("skin_url") as HTMLInputElement;
	const url = obtainTextureUrl("skin_url");
	if (url === "") {
		skinViewer.loadSkin(null);
		input?.setCustomValidity("");
	} else {
		const skinModel = document.getElementById("skin_model") as HTMLSelectElement;
		const earsSource = document.getElementById("ears_source") as HTMLSelectElement;

		skinViewer
			.loadSkin(url, {
				model: skinModel?.value as ModelType,
				ears: earsSource?.value === "current_skin",
			})
			.then(() => input?.setCustomValidity(""))
			.catch(e => {
				input?.setCustomValidity("Image can't be loaded.");
				console.error(e);
			});
	}
}

function reloadCape(): void {
	const input = document.getElementById("cape_url") as HTMLInputElement;
	const url = obtainTextureUrl("cape_url");
	if (url === "") {
		skinViewer.loadCape(null);
		input?.setCustomValidity("");
	} else {
		const selectedBackEquipment = document.querySelector(
			'input[type="radio"][name="back_equipment"]:checked'
		) as HTMLInputElement;
		skinViewer
			.loadCape(url, { backEquipment: selectedBackEquipment?.value as BackEquipment })
			.then(() => input?.setCustomValidity(""))
			.catch(e => {
				input?.setCustomValidity("Image can't be loaded.");
				console.error(e);
			});
	}
}

function reloadEars(skipSkinReload = false): void {
	const earsSource = document.getElementById("ears_source") as HTMLSelectElement;
	const sourceType = earsSource?.value;
	let hideInput = true;

	if (sourceType === "none") {
		skinViewer.loadEars(null);
	} else if (sourceType === "current_skin") {
		if (!skipSkinReload) {
			reloadSkin();
		}
	} else {
		hideInput = false;
		const options = document.querySelectorAll<HTMLOptionElement>("#default_ears option[data-texture-type]");
		for (const opt of options) {
			opt.disabled = opt.dataset.textureType !== sourceType;
		}

		const input = document.getElementById("ears_url") as HTMLInputElement;
		const url = obtainTextureUrl("ears_url");
		if (url === "") {
			skinViewer.loadEars(null);
			input?.setCustomValidity("");
		} else {
			skinViewer
				.loadEars(url, { textureType: sourceType as "standalone" | "skin" })
				.then(() => input?.setCustomValidity(""))
				.catch(e => {
					input?.setCustomValidity("Image can't be loaded.");
					console.error(e);
				});
		}
	}

	const el = document.getElementById("ears_texture_input");
	if (hideInput) {
		if (el && !el.classList.contains("hidden")) {
			el.classList.add("hidden");
		}
	} else if (el) {
		el.classList.remove("hidden");
	}
}

function reloadPanorama(): void {
	const input = document.getElementById("panorama_url") as HTMLInputElement;
	const url = obtainTextureUrl("panorama_url");
	if (url === "") {
		skinViewer.background = null;
		input?.setCustomValidity("");
	} else {
		skinViewer
			.loadPanorama(url)
			.then(() => input?.setCustomValidity(""))
			.catch(e => {
				input?.setCustomValidity("Image can't be loaded.");
				console.error(e);
			});
	}
}

function updateBackground(): void {
	const backgroundType = (document.getElementById("background_type") as HTMLSelectElement)?.value;
	const panoramaSection =
		document.querySelector(".control-section h1")?.textContent === "Panorama"
			? document.querySelector(".control-section h1")?.parentElement
			: null;

	if (backgroundType === "color") {
		const color = (document.getElementById("background_color") as HTMLInputElement)?.value;
		skinViewer.background = color;
		if (panoramaSection) {
			panoramaSection.style.display = "none";
		}
	} else {
		if (panoramaSection) {
			panoramaSection.style.display = "block";
		}
		reloadPanorama();
	}
}

function reloadNameTag(): void {
	const text = (document.getElementById("nametag_text") as HTMLInputElement)?.value;
	if (text === "") {
		skinViewer.nameTag = null;
	} else {
		skinViewer.nameTag = text;
	}
}

function initializeControls(): void {
	const canvasWidth = document.getElementById("canvas_width") as HTMLInputElement;
	const canvasHeight = document.getElementById("canvas_height") as HTMLInputElement;
	const fov = document.getElementById("fov") as HTMLInputElement;
	const zoom = document.getElementById("zoom") as HTMLInputElement;
	const globalLight = document.getElementById("global_light") as HTMLInputElement;
	const cameraLight = document.getElementById("camera_light") as HTMLInputElement;
	const animationPauseResume = document.getElementById("animation_pause_resume");
	const autoRotate = document.getElementById("auto_rotate") as HTMLInputElement;
	const autoRotateSpeed = document.getElementById("auto_rotate_speed") as HTMLInputElement;
	const controlRotate = document.getElementById("control_rotate") as HTMLInputElement;
	const controlZoom = document.getElementById("control_zoom") as HTMLInputElement;
	const controlPan = document.getElementById("control_pan") as HTMLInputElement;
	const animationSpeed = document.getElementById("animation_speed") as HTMLInputElement;
	const hitSpeed = document.getElementById("hit_speed") as HTMLInputElement;
	const hitSpeedLabel = document.getElementById("hit_speed_label");
	const animationCrouch = document.getElementById("animation_crouch") as HTMLInputElement;
	const addHittingAnimation = document.getElementById("add_hitting_animation") as HTMLInputElement;

	canvasWidth?.addEventListener("change", e => {
		const target = e.target as HTMLInputElement;
		skinViewer.width = Number(target.value);
	});

	canvasHeight?.addEventListener("change", e => {
		const target = e.target as HTMLInputElement;
		skinViewer.height = Number(target.value);
	});

	fov?.addEventListener("change", e => {
		const target = e.target as HTMLInputElement;
		skinViewer.fov = Number(target.value);
	});

	zoom?.addEventListener("change", e => {
		const target = e.target as HTMLInputElement;
		skinViewer.zoom = Number(target.value);
	});

	globalLight?.addEventListener("change", e => {
		const target = e.target as HTMLInputElement;
		skinViewer.globalLight.intensity = Number(target.value);
	});

	cameraLight?.addEventListener("change", e => {
		const target = e.target as HTMLInputElement;
		skinViewer.cameraLight.intensity = Number(target.value);
	});

	animationPauseResume?.addEventListener("click", () => {
		if (skinViewer.animation) {
			skinViewer.animation.paused = !skinViewer.animation.paused;
		}
	});

	autoRotate?.addEventListener("change", e => {
		const target = e.target as HTMLInputElement;
		skinViewer.autoRotate = target.checked;
	});

	autoRotateSpeed?.addEventListener("change", e => {
		const target = e.target as HTMLInputElement;
		skinViewer.autoRotateSpeed = Number(target.value);
	});

	const animationRadios = document.querySelectorAll<HTMLInputElement>('input[type="radio"][name="animation"]');
	for (const el of animationRadios) {
		el.addEventListener("change", e => {
			const target = e.target as HTMLInputElement;
			const crouchSetting = document.getElementById("crouch_setting");
			if (crouchSetting) {
				crouchSetting.style.display = animationCrouch?.checked ? "block" : "none";
			}

			if (target.value === "") {
				skinViewer.animation = null;
			} else {
				skinViewer.animation = availableAnimations[target.value];
				if (skinViewer.animation && animationSpeed) {
					skinViewer.animation.speed = Number(animationSpeed.value);
				}
			}
		});
	}

	animationCrouch?.addEventListener("change", () => {
		const crouchSettings = document.querySelectorAll<HTMLInputElement>(
			'input[type="checkbox"][name="crouch_setting_item"]'
		);
		for (const el of crouchSettings) {
			el.checked = false;
		}
		if (hitSpeed) {
			hitSpeed.value = "";
		}
		if (hitSpeedLabel) {
			hitSpeedLabel.style.display = "none";
		}
	});

	const crouchSettings = {
		runOnce: (value: boolean) => {
			if (skinViewer.animation) {
				(skinViewer.animation as unknown as { runOnce: boolean }).runOnce = value;
			}
		},
		showProgress: (value: boolean) => {
			if (skinViewer.animation) {
				(skinViewer.animation as unknown as { showProgress: boolean }).showProgress = value;
			}
		},
		addHitAnimation: (value: boolean) => {
			if (hitSpeedLabel) {
				hitSpeedLabel.style.display = value ? "block" : "none";
			}
			if (value && skinViewer.animation) {
				const hitSpeedValue = hitSpeed?.value;
				if (hitSpeedValue === "") {
					(skinViewer.animation as unknown as { addHitAnimation: () => void }).addHitAnimation();
				} else {
					(skinViewer.animation as unknown as { addHitAnimation: (speed: string) => void }).addHitAnimation(
						hitSpeedValue
					);
				}
			}
		},
	};

	const updateCrouchAnimation = () => {
		skinViewer.animation = new skinview3d.CrouchAnimation();
		if (skinViewer.animation && animationSpeed) {
			skinViewer.animation.speed = Number(animationSpeed.value);
		}
		const crouchSettingItems = document.querySelectorAll<HTMLInputElement>(
			'input[type="checkbox"][name="crouch_setting_item"]'
		);
		for (const el of crouchSettingItems) {
			const setting = crouchSettings[el.value as keyof typeof crouchSettings];
			if (setting) {
				setting(el.checked);
			}
		}
	};

	const crouchSettingItems = document.querySelectorAll<HTMLInputElement>(
		'input[type="checkbox"][name="crouch_setting_item"]'
	);
	for (const el of crouchSettingItems) {
		el.addEventListener("change", () => {
			updateCrouchAnimation();
		});
	}

	hitSpeed?.addEventListener("change", () => {
		updateCrouchAnimation();
	});

	animationSpeed?.addEventListener("change", e => {
		const target = e.target as HTMLInputElement;
		if (skinViewer.animation) {
			skinViewer.animation.speed = Number(target.value);
		}
		if (animationCrouch?.checked && addHittingAnimation?.checked && hitSpeed?.value === "") {
			updateCrouchAnimation();
		}
	});

	controlRotate?.addEventListener("change", e => {
		const target = e.target as HTMLInputElement;
		skinViewer.controls.enableRotate = target.checked;
	});

	controlZoom?.addEventListener("change", e => {
		const target = e.target as HTMLInputElement;
		skinViewer.controls.enableZoom = target.checked;
	});

	controlPan?.addEventListener("change", e => {
		const target = e.target as HTMLInputElement;
		skinViewer.controls.enablePan = target.checked;
	});

	for (const part of skinParts) {
		for (const layer of skinLayers) {
			const checkbox = document.querySelector<HTMLInputElement>(
				`#layers_table input[type="checkbox"][data-part="${part}"][data-layer="${layer}"]`
			);
			checkbox?.addEventListener("change", e => {
				const target = e.target as HTMLInputElement;
				skinViewer.playerObject.skin[part][layer].visible = target.checked;
			});
		}
	}

	const initializeUploadButton = (id: string, callback: () => void) => {
		const urlInput = document.getElementById(id) as HTMLInputElement;
		const fileInput = document.getElementById(`${id}_upload`) as HTMLInputElement;
		const unsetButton = document.getElementById(`${id}_unset`);

		const unsetAction = () => {
			if (urlInput) {
				urlInput.readOnly = false;
				urlInput.value = "";
			}
			if (fileInput) {
				fileInput.value = fileInput.defaultValue;
			}
			callback();
		};

		fileInput?.addEventListener("change", () => callback());
		urlInput?.addEventListener("keydown", e => {
			if (e.key === "Backspace" && urlInput?.readOnly) {
				unsetAction();
			}
		});
		unsetButton?.addEventListener("click", () => unsetAction());
	};

	initializeUploadButton("skin_url", reloadSkin);
	initializeUploadButton("cape_url", reloadCape);
	initializeUploadButton("ears_url", reloadEars);
	initializeUploadButton("panorama_url", reloadPanorama);

	const skinUrl = document.getElementById("skin_url") as HTMLInputElement;
	const skinModel = document.getElementById("skin_model") as HTMLSelectElement;
	const capeUrl = document.getElementById("cape_url") as HTMLInputElement;
	const earsSource = document.getElementById("ears_source") as HTMLSelectElement;
	const earsUrl = document.getElementById("ears_url") as HTMLInputElement;
	const panoramaUrl = document.getElementById("panorama_url") as HTMLInputElement;

	skinUrl?.addEventListener("change", reloadSkin);
	skinModel?.addEventListener("change", reloadSkin);
	capeUrl?.addEventListener("change", reloadCape);
	earsSource?.addEventListener("change", () => reloadEars());
	earsUrl?.addEventListener("change", () => reloadEars());
	panoramaUrl?.addEventListener("change", reloadPanorama);

	const backEquipmentRadios = document.querySelectorAll<HTMLInputElement>('input[type="radio"][name="back_equipment"]');
	for (const el of backEquipmentRadios) {
		el.addEventListener("change", e => {
			const target = e.target as HTMLInputElement;
			if (skinViewer.playerObject.backEquipment === null) {
				// cape texture hasn't been loaded yet
				// this option will be processed on texture loading
			} else {
				skinViewer.playerObject.backEquipment = target.value as BackEquipment;
			}
		});
	}

	const resetAll = document.getElementById("reset_all");
	resetAll?.addEventListener("click", () => {
		skinViewer.dispose();
		initializeViewer();
	});

	const nametagText = document.getElementById("nametag_text") as HTMLInputElement;
	nametagText?.addEventListener("change", reloadNameTag);

	const backgroundType = document.getElementById("background_type") as HTMLSelectElement;
	const backgroundColor = document.getElementById("background_color") as HTMLInputElement;

	backgroundType?.addEventListener("change", updateBackground);
	backgroundColor?.addEventListener("change", updateBackground);

	// Set panorama as default
	if (backgroundType) {
		backgroundType.value = "panorama";
	}

	// Initialize background type
	updateBackground();
}

function initializeViewer(): void {
	const skinContainer = document.getElementById("skin_container") as HTMLCanvasElement;
	if (!skinContainer) {
		throw new Error("Canvas element not found");
	}

	skinViewer = new skinview3d.SkinViewer({
		canvas: skinContainer,
	});

	const canvasWidth = document.getElementById("canvas_width") as HTMLInputElement;
	const canvasHeight = document.getElementById("canvas_height") as HTMLInputElement;
	const fov = document.getElementById("fov") as HTMLInputElement;
	const zoom = document.getElementById("zoom") as HTMLInputElement;
	const globalLight = document.getElementById("global_light") as HTMLInputElement;
	const cameraLight = document.getElementById("camera_light") as HTMLInputElement;
	const autoRotate = document.getElementById("auto_rotate") as HTMLInputElement;
	const autoRotateSpeed = document.getElementById("auto_rotate_speed") as HTMLInputElement;
	const controlRotate = document.getElementById("control_rotate") as HTMLInputElement;
	const controlZoom = document.getElementById("control_zoom") as HTMLInputElement;
	const controlPan = document.getElementById("control_pan") as HTMLInputElement;
	const animationSpeed = document.getElementById("animation_speed") as HTMLInputElement;

	skinViewer.width = Number(canvasWidth?.value);
	skinViewer.height = Number(canvasHeight?.value);
	skinViewer.fov = Number(fov?.value);
	skinViewer.zoom = Number(zoom?.value);
	skinViewer.globalLight.intensity = Number(globalLight?.value);
	skinViewer.cameraLight.intensity = Number(cameraLight?.value);
	skinViewer.autoRotate = autoRotate?.checked ?? false;
	skinViewer.autoRotateSpeed = Number(autoRotateSpeed?.value);

	const animationRadio = document.querySelector<HTMLInputElement>('input[type="radio"][name="animation"]:checked');
	const animationName = animationRadio?.value;
	if (animationName) {
		skinViewer.animation = availableAnimations[animationName];
		if (skinViewer.animation && animationSpeed) {
			skinViewer.animation.speed = Number(animationSpeed.value);
		}
	}

	skinViewer.controls.enableRotate = controlRotate?.checked ?? false;
	skinViewer.controls.enableZoom = controlZoom?.checked ?? false;
	skinViewer.controls.enablePan = controlPan?.checked ?? false;

	for (const part of skinParts) {
		for (const layer of skinLayers) {
			const checkbox = document.querySelector<HTMLInputElement>(
				`#layers_table input[type="checkbox"][data-part="${part}"][data-layer="${layer}"]`
			);
			skinViewer.playerObject.skin[part][layer].visible = checkbox?.checked ?? false;
		}
	}

	reloadSkin();
	reloadCape();
	reloadEars(true);
	reloadPanorama();
	reloadNameTag();
}

initializeViewer();
initializeControls();
