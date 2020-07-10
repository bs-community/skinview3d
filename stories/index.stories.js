/* eslint-disable */
import * as skinview3d from "../libs/skinview3d";
import { withKnobs, radios, number } from "@storybook/addon-knobs";

export default {
	title: "Skinview3d",
	decorators: [withKnobs],
};

let currentAnimation;

const createViewer = () => {
	const element = document.createElement("div");
	const viewer = new skinview3d.SkinViewer(element, {
		width: 300,
		height: 400,
		skin: "texture/1_8_texturemap_redux.png",
	});

	console.log(viewer);

	// Control objects with your mouse!
	const control = skinview3d.createOrbitControls(viewer);
	control.enableRotate = true;
	control.enableZoom = false;
	control.enablePan = false;

	// Add an animation
	currentAnimation = viewer.animations.add(skinview3d.WalkingAnimation);

	return { viewer, element };
};

let { viewer, element } = createViewer();

export const Basic = () => {
	// reset
	let { viewer, element } = createViewer();
	if (currentAnimation) {
		currentAnimation.remove();
	}

	return element;
};

export const Animation = () => {
	if (currentAnimation) {
		currentAnimation.remove();
	}

	const animationMap = {
		Walk: skinview3d.WalkingAnimation,
		Run: skinview3d.RunningAnimation,
		Rotate: skinview3d.RotatingAnimation,
	};

	const animationKey = radios("Animations", Object.keys(animationMap), "Run");
	currentAnimation = viewer.animations.add(animationMap[animationKey]);

	const label = "Speed";

	const defaultValue = 0.5;
	const options = {
		range: true,
		min: 0.1,
		max: 2,
		step: 0.01,
	};
	const value = number(label, defaultValue, options);

	currentAnimation.speed = value;

	return element;
};

export const Textures = () => {
	const skinOptions = {
		"1.8 Skin": "1_8_texturemap_redux",
		"Classic Skin": "Hacksore",
		"HD Skin": "ironman_hd",
	};
	const skinUrl = radios("Skin Textures", skinOptions, "1_8_texturemap_redux");

	const capeOptions = {
		None: "none",
		"Classic Cape": "cape",
		"HD Cape": "hd_cape",
	};

	const capeUrl = radios("Cape Textures", capeOptions, "none");
	viewer.loadSkin(`texture/${skinUrl}.png`);

	if (capeUrl === "none") {
		viewer.loadCape(null);
	}

	viewer.loadCape(`texture/${capeUrl}.png`);

	return element;
};
