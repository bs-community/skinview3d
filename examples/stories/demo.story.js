import * as skinview3d from "../../libs/skinview3d";
import { createViewer } from "./util";
import { radios, withKnobs, optionsKnob, number } from "@storybook/addon-knobs";
let { viewer, element } = createViewer();

let currentAnimation;

const bodyParts = viewer.playerObject.skin;
const skinParts = {};

// set inner parts
skinParts.head = bodyParts.head.innerLayer;
skinParts.body = bodyParts.body.innerLayer;
skinParts.leftArm = bodyParts.leftArm.innerLayer;
skinParts.rightArm = bodyParts.rightArm.innerLayer;
skinParts.leftLeg = bodyParts.leftLeg.innerLayer;
skinParts.rightLeg = bodyParts.rightLeg.innerLayer;

// set outter parts
skinParts.head2 = bodyParts.head.outerLayer;
skinParts.body2 = bodyParts.body.outerLayer;
skinParts.leftArm2 = bodyParts.leftArm.outerLayer;
skinParts.rightArm2 = bodyParts.rightArm.outerLayer;
skinParts.leftLeg2 = bodyParts.leftLeg.outerLayer;
skinParts.rightLeg2 = bodyParts.rightLeg.outerLayer;

export default {
	title: "Skinview3d",
	decorators: [withKnobs],
};

const handleSizeControl = () => {
	const width = number("Canvas Width", 300);
	const height = number("Canvas Height", 400);

	viewer.setSize(width, height);
};

const handleTextureControl = () => {
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
	viewer.loadSkin(`textures/${skinUrl}.png`);

	if (capeUrl === "none") {
		viewer.loadCape(null);
	} else {
		viewer.loadCape(`textures/${capeUrl}.png`);
	}

	// bottom layers
	const valuesBottomLayer = {
		Head: "head",
		Body: "body",
		LeftArm: "leftArm",
		RightArm: "rightArm",
		RightLeg: "rightLeg",
		LeftLeg: "leftLeg",
	};

	const optionsBottomLayer = optionsKnob(
		"Bottom Layer",
		valuesBottomLayer,
		Object.values(valuesBottomLayer),
		{
			display: "inline-check",
		}
	);

	// bottom layers
	const valuesTopLayer = {
		Head2: "head2",
		Body2: "body2",
		LeftArm2: "leftArm2",
		RightArm2: "rightArm2",
		RightLeg2: "rightLeg2",
		LeftLeg2: "leftLeg2",
	};

	const optionsTopLayer = optionsKnob(
		"Top Layer",
		valuesTopLayer,
		Object.values(valuesTopLayer),
		{
			display: "inline-check",
		}
	);

	// toggle parts
	console.log(skinParts);
	for (let partName in skinParts) {
		const visible = optionsBottomLayer
			.concat(optionsTopLayer)
			.includes(partName);

		skinParts[partName].visible = visible;
	}
};

const handleAnimationControl = () => {
	if (currentAnimation) {
		currentAnimation.remove();
	}

	const animationMap = {
		None: null,
		Walk: skinview3d.WalkingAnimation,
		Run: skinview3d.RunningAnimation,
		Rotate: skinview3d.RotatingAnimation,
	};

	const animationKey = radios("Animations", Object.keys(animationMap), "Run");

	console.log("animationKey", animationKey);
	if (currentAnimation || animationKey === "None") {
		currentAnimation.resetAndRemove();
	}

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
};

export const Component = () => {
	handleSizeControl();
	handleTextureControl();
	handleAnimationControl();

	return element;
};

Component.story = {
	name: "Demo",
};
