/* eslint-disable */
import * as skinview3d from '../libs/skinview3d';
import { withKnobs, radios, number  } from '@storybook/addon-knobs';

export default {
	title: 'Skinview3d',
	decorators: [withKnobs]
};

let currentAnimation;

const createViewer = () => {
	const element = document.createElement('div');
  element.style.width = '400px';
	element.style.height = '500px';

	let viewer = new skinview3d.SkinViewer({
		domElement: element,
		width: 600,
		height: 600,
		skinUrl: 'texture/1_8_texturemap_redux.png',
	});

	let control = skinview3d.createOrbitControls(viewer);
	control.enableRotate = true;
	control.enableZoom = false;
	control.enablePan = false;

	return { viewer, element };
}

let { viewer, element } = createViewer();

export const NoAnimation = () => {
	if (currentAnimation) {
		currentAnimation.remove();
	}

	return element;
};

export const WithAnimation = () => {

	if (currentAnimation) {
		currentAnimation.remove();
	}

	const animationMap = {
		'Walk': skinview3d.WalkingAnimation,
		'Run': skinview3d.RunningAnimation,
		'Rotate': skinview3d.RotatingAnimation,
	};

	const animationKey = radios('Animations', Object.keys(animationMap), 'Run');
	currentAnimation = viewer.animations.add(animationMap[animationKey]);


	const label = 'Speed';

	const defaultValue = 1;
	const options = {
		 range: true,
		 min: 0.1,
		 max: 3,
		 step: 0.01,
	};
	const value = number(label, defaultValue, options);

	currentAnimation.speed = value;

	return element;
};

export const TestTextures = () => {

	const skinOptions = {
		'1.8 Skin': '1_8_texturemap_redux',
		'Classic Skin': 'Hacksore',
		'HD Skin': 'ironman_hd',
	};
	const skinUrl = radios('Skin Textures', skinOptions, '1_8_texturemap_redux');

	const capeOptions = {
		'None': 'none',
		'Classic Cape': 'cape',
		'HD Cape': 'hd_cape',
	};

	const capeUrl = radios('Cape Textures', capeOptions, 'none');
	viewer.skinUrl = `texture/${skinUrl}.png`;

	// Will fix with #48
	viewer.capeUrl = capeUrl !== 'none' ? `texture/${capeUrl}.png` : null;

	return element;
};
