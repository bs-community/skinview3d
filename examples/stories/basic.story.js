/* eslint-disable */
import { createViewer } from "./util";
import { withKnobs, number } from "@storybook/addon-knobs";
let { viewer, element } = createViewer();

export default {
	title: "Skinview3d",
	name: "Basic",
	decorators: [withKnobs],
};

export const Basic = () => {
	const width = number("Canvas Width", 300);
	const height = number("Canvas Height", 400);

	viewer.setSize(width, height);

	return element;
};
