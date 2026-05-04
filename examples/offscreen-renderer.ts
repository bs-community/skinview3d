import * as skinview3d from "../src/skinview3d";
import "./style.css";

let netheriteArmor = new skinview3d.ArmorType("./img/armor/netherite_layer_1.png", "./img/armor/netherite_layer_2.png");
let diamondArmor = new skinview3d.ArmorType("./img/armor/diamond_layer_1.png", "./img/armor/diamond_layer_2.png");
let turtleHelmet = new skinview3d.ArmorType("./img/armor/turtle_layer_1.png");
let crusaderArmor = new skinview3d.ArmorType("./img/armor/crusader_layer_1.png", "./img/armor/crusader_layer_2.png");

const configurations = [
	{
		skin: "img/1_8_texturemap_redux.png",
		cape: null,
	},
	{
		skin: "img/hacksore.png",
		cape: "img/legacy_cape.png",
		armor: {
			leggings: crusaderArmor,
			helmet: crusaderArmor
		},
	},
	{
		skin: "img/haka.png",
		cape: "img/mojang_cape.png",
		armor: {
			boots: netheriteArmor,
			leggings: netheriteArmor,
			chestplate: netheriteArmor
		},
	},
	{
		skin: "img/hatsune_miku.png",
		cape: "img/mojang_cape.png",
		backEquipment: "elytra",
		armor: {
			boots: diamondArmor
		},
	},
	{
		skin: "img/ironman_hd.png",
		cape: "img/hd_cape.png",
	},
	{
		skin: "img/sethbling.png",
		cape: null,
		armor: {
			helmet: turtleHelmet
		},
	}
];

(async function () {
	const skinViewer = new skinview3d.SkinViewer({
		width: 200,
		height: 300,
		renderPaused: true,
	});

	skinViewer.camera.rotation.x = -0.620;
	skinViewer.camera.rotation.y = 0.534;
	skinViewer.camera.rotation.z = 0.348;
	skinViewer.camera.position.x = 30.5;
	skinViewer.camera.position.y = 22.0;
	skinViewer.camera.position.z = 42.0;

	for (const config of configurations) {
		await Promise.all([
			skinViewer.loadSkin(config.skin),
			skinViewer.loadCape(config.cape, { backEquipment: config.backEquipment }),
			skinViewer.loadArmor(config.armor),
		]);
		skinViewer.render();
		const image = skinViewer.canvas.toDataURL();

		const imgElement = document.createElement("img");
		imgElement.src = image;
		imgElement.width = skinViewer.width;
		imgElement.height = skinViewer.height;
		document.getElementById("rendered_imgs").appendChild(imgElement);
	}

	skinViewer.dispose();
})();
