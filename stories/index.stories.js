/* eslint-disable */
import * as skinview3d from '../libs/skinview3d';
import { withKnobs, radios, number  } from "@storybook/addon-knobs";

export default {
	title: 'Skinview3d',
	decorators: [withKnobs]
};

const createViewer = () => {
	const element = document.createElement('div');
  element.style.width = '400px';
	element.style.height = '500px';

	let viewer = new skinview3d.SkinViewer({
		domElement: element,
		width: 600,
		height: 600,
		skinUrl: "texture/1_8_texturemap_redux.png",
	});

	let control = skinview3d.createOrbitControls(viewer);
	control.enableRotate = true;
	control.enableZoom = false;
	control.enablePan = false;

	return { viewer, element };
}

const { viewer, element } = createViewer();

export const NoAnimation = () => {

	return element;
};

export const WithAnimation = () => {


	let walk = viewer.animations.add(skinview3d.WalkingAnimation);

	const label = 'Speed';
	const defaultValue = 1;
	const options = {
		 range: true,
		 min: 0.1,
		 max: 3,
		 step: 0.01,
	};
	const groupId = 'GROUP-ANIMATION';
	const value = number(label, defaultValue, options, groupId);

	walk.speed = value;

	return element;
};

export const TestSkins = () => {

	const label = 'Skin Textures';
	const options = {
		'1.8 Skin': '1_8_texturemap_redux',
		'Classic Skin': 'Hacksore',
		'HD Skin': 'ironman_hd',
	};
	const defaultValue = '1_8_texturemap_redux';
	const groupId = 'SKIN-GROUP';

	const skinUrl = radios(label, options, defaultValue, groupId);

	viewer.skinUrl = `texture/${skinUrl}.png`;

	return element;
};
