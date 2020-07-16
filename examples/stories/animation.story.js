/* eslint-disable */
import { createViewer } from "./util";
import { withKnobs, number } from "@storybook/addon-knobs";
import * as skinview3d from "../..";
import { radios } from "@storybook/addon-knobs";

let { viewer, element, defaultAnimation } = createViewer();
let currentAnimation = defaultAnimation;

export default {
	title: "Skinview3d",
	name: "Animation",
	decorators: [withKnobs],
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

	if (currentAnimation) {
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

	return element;
};
