import { PlayerObject } from "./model"

function invokeAnimation(animation: Animation, player: PlayerObject, time: number) {
	if (animation instanceof CompositeAnimation) {
		animation.play(player, time);
	} else if (animation instanceof Function) {
		animation(player, time);
	} else {
		throw `Not an animation: ${animation}`;
	}
}

interface IAnimation {
	play(player: PlayerObject, time: number): void;
}

type AnimationFn = (player: PlayerObject, time: number) => void;
type Animation = AnimationFn | IAnimation;

class AnimationHandle implements IAnimation {
	animation: Animation;
	paused = false;
	speed: number = 1.0;

	private _paused = false;
	private _lastChange: number = null;
	private _speed: number = 1.0;
	private _lastChangeX: number = null;

	constructor(animation: Animation) {
		this.animation = animation;
	}

	play(player: PlayerObject, time: number) {
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

	reset() {
		this._lastChange = null;
	}

	remove(animHandle: AnimationHandle) {
		// stub get's overriden
	}
}

class CompositeAnimation {

	handles: Set<AnimationHandle>;

	constructor() {
		this.handles = new Set();
	}
	add(animation: Animation) {
		const handle = new AnimationHandle(animation);
		handle.remove = () => this.handles.delete(handle);
		this.handles.add(handle);
		return handle;
	}
	play(player: PlayerObject, time: number) {
		this.handles.forEach(handle => handle.play(player, time));
	}
}

let WalkingAnimation: Animation = (player: PlayerObject, time: number) => {
	let skin = player.skin;

	// Multiply by animation's natural speed
	time *= 8;

	// Leg swing
	skin.leftLeg.rotation.x = Math.sin(time) * 0.5;
	skin.rightLeg.rotation.x = Math.sin(time + Math.PI) * 0.5;

	// Arm swing
	skin.leftArm.rotation.x = Math.sin(time + Math.PI) * 0.5;
	skin.rightArm.rotation.x = Math.sin(time) * 0.5;
	let basicArmRotationZ = Math.PI * 0.02;
	skin.leftArm.rotation.z = Math.cos(time) * 0.03 + basicArmRotationZ;
	skin.rightArm.rotation.z = Math.cos(time + Math.PI) * 0.03 - basicArmRotationZ;

	// Head shaking with different frequency & amplitude
	skin.head.rotation.y = Math.sin(time / 4) * 0.2;
	skin.head.rotation.x = Math.sin(time / 5) * 0.1;

	// Always add an angle for cape around the x axis
	let basicCapeRotationX = Math.PI * 0.06;
	player.cape.rotation.x = Math.sin(time / 1.5) * 0.06 + basicCapeRotationX;
};

let RunningAnimation: Animation = (player: PlayerObject, time: number) => {
	let skin = player.skin;

	time *= 15;

	// Leg swing with larger amplitude
	skin.leftLeg.rotation.x = Math.cos(time + Math.PI) * 1.3;
	skin.rightLeg.rotation.x = Math.cos(time) * 1.3;

	// Arm swing
	skin.leftArm.rotation.x = Math.cos(time) * 1.5;
	skin.rightArm.rotation.x = Math.cos(time + Math.PI) * 1.5;
	let basicArmRotationZ = Math.PI * 0.1;
	skin.leftArm.rotation.z = Math.cos(time) * 0.1 + basicArmRotationZ;
	skin.rightArm.rotation.z = Math.cos(time + Math.PI) * 0.1 - basicArmRotationZ;

	// Jumping
	player.position.y = Math.cos(time * 2);
	// Dodging when running
	player.position.x = Math.cos(time) * 0.15;
	// Slightly tilting when running
	player.rotation.z = Math.cos(time + Math.PI) * 0.01;

	// Apply higher swing frequency, lower amplitude,
	// and greater basic rotation around x axis,
	// to cape when running.
	let basicCapeRotationX = Math.PI * 0.3;
	player.cape.rotation.x = Math.sin(time * 2) * 0.1 + basicCapeRotationX;

	// What about head shaking?
	// You shouldn't glance right and left when running dude :P
};

let RotatingAnimation: Animation = (player: PlayerObject, time: number) => {
	player.rotation.y = time;
};

export {
	CompositeAnimation,
	invokeAnimation,
	WalkingAnimation,
	RunningAnimation,
	RotatingAnimation
};
