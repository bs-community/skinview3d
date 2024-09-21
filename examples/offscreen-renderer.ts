import * as skinview3d from "../src/skinview3d";
import "./style.css";

const configurations = [
	{
		skin: "img/1_8_texturemap_redux.png",
		cape: null,
	},
	{
		skin: "img/hacksore.png",
		cape: "img/legacy_cape.png",
	},
	{
		skin: "img/haka.png",
		cape: "img/mojang_cape.png",
	},
	{
		skin: "img/hatsune_miku.png",
		cape: "img/mojang_cape.png",
		backEquipment: "elytra",
	},
	{
		skin: "img/ironman_hd.png",
		cape: "img/hd_cape.png",
	},
	{
		skin: "img/sethbling.png",
		cape: null,
	},
];

(async function () {
	const skinViewer = new skinview3d.SkinViewer({
		width: 200,
		height: 300,
		renderPaused: true,
	});

	skinViewer.camera.rotation.x = -0.62;
	skinViewer.camera.rotation.y = 0.534;
	skinViewer.camera.rotation.z = 0.348;
	skinViewer.camera.position.x = 30.5;
	skinViewer.camera.position.y = 22.0;
	skinViewer.camera.position.z = 42.0;

	for (const config of configurations) {
		await Promise.all([
			skinViewer.loadSkin(config.skin),
			skinViewer.loadCape(config.cape, { backEquipment: config.backEquipment }),
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
