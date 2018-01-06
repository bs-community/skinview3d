let WalkAnimation = (player, time) => {
	let skin = player.skin;
	let angleRot = time + Math.PI / 2;

	// Leg Swing
	skin.leftLeg.rotation.x = Math.cos(angleRot);
	skin.rightLeg.rotation.x = Math.cos(angleRot + (Math.PI));

	// Arm Swing
	skin.leftArm.rotation.x = Math.cos(angleRot + (Math.PI));
	skin.rightArm.rotation.x = Math.cos(angleRot);
};

export { WalkAnimation };
