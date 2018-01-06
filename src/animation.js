function invokeAnimation(animation, player, time) {
	if (animation instanceof CompositeAnimation) {
		animation.play(player, time);
	} else if (animation instanceof Function) {
		animation(player, time);
	} else {
		throw `Not an animation: ${animation}`;
	}
}

class AnimationHandle {
	constructor(animation) {
		this.animation = animation;
		this.paused = this._paused = false;
		this.speed = this._speed = 1.0;
		this._lastChange = null;
		this._lastChangeX = null;
	}
	play(player, time) {
		if (this._lastChange === null) {
			this._lastChange = time;
			this._lastChangeX = 0;
		} else if (this.paused !== this._paused || this.speed !== this._speed) {
			let dt = time - this._lastChange;
			if (this._paused === false) {
				this._lastChangeX += dt * this._speed;
			}
			this._paused = this.paused;
			this._speed = this.speed;
			this._lastChange = time;
		}
		if (this.paused === false) {
			let dt = time - this._lastChange;
			let x = this._lastChangeX + this.speed * dt;
			invokeAnimation(this.animation, player, x);
		}
	}
	reset(){
		this._lastChange = null;
	}
}

class CompositeAnimation {
	constructor() {
		this.handles = new Set();
	}
	add(animation) {
		let handle = new AnimationHandle(animation);
		handle.remove = () => this.handles.delete(handle);
		this.handles.add(handle);
		return handle;
	}
	play(player, time) {
		this.handles.forEach(handle => handle.play(player, time));
	}
}

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

export { CompositeAnimation, WalkAnimation, invokeAnimation };
