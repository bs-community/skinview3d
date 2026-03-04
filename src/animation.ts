import { PlayerObject } from "./model.js";
import { Quaternion, Vector3 } from "three";

/**
 * An animation which can be played on a {@link PlayerObject}.
 *
 * This is an abstract class. Subclasses of this class would implement
 * particular animations.
 */
export abstract class PlayerAnimation {
	/**
	 * The speed of the animation.
	 *
	 * @defaultValue `1.0`
	 */
	speed: number = 1.0;

	/**
	 * Whether the animation is paused.
	 *
	 * @defaultValue `false`
	 */
	paused: boolean = false;

	/**
	 * The current progress of the animation.
	 */
	progress: number = 0;

	/**
	 * Plays the animation.
	 *
	 * @param player - the player object
	 * @param delta - progress difference since last call
	 */
	protected abstract animate(player: PlayerObject, delta: number): void;

	private currentId: number = 0;
	private progress0: Map<number, number> = new Map();
	private animationObjects: Map<number, (player: PlayerObject, progress: number, currentId: number) => void> =
		new Map();
	/**
	 * Plays the animation, and update the progress.
	 *
	 * The elapsed time `deltaTime` will be scaled by {@link speed}.
	 * If {@link paused} is `true`, this method will do nothing.
	 *
	 * @param player - the player object
	 * @param deltaTime - time elapsed since last call
	 */
	update(player: PlayerObject, deltaTime: number): void {
		if (this.paused) {
			return;
		}
		const delta = deltaTime * this.speed;
		this.animate(player, delta);
		this.animationObjects.forEach(
			(animation: (player: PlayerObject, progress: number, currentId: number) => void, id: number) => {
				const progress0: number = this.progress0.get(id) as number;
				animation(player, this.progress - progress0, id);
			}
		);
		this.progress += delta;
	}
	/**
	 * Adds a new animation based on the original animation and returns its id.
	 *
	 * @param fn - The animation function to be added, which takes a player object and progress value.When calling addAnimation. progress is 0.
	 * @returns The id of the newly added animation.
	 *
	 * @example
	 * Rotate the player while playing the idle animation.
	 * ```
	 * skinViewer.animation = new skinview3d.IdleAnimation();
	 * skinViewer.animation.addAnimation((player, progress)=>player.rotation.y = progress);
	 * ```
	 */
	addAnimation(fn: (player: PlayerObject, progress: number, currentId: number) => void): number {
		const id = this.currentId++;
		this.progress0.set(id, this.progress);
		this.animationObjects.set(id, fn);
		return id;
	}
	/**
	 * Removes an animation created by the addAnimation method by its id.
	 *
	 * If the id is undefined, this method will do nothing.
	 *
	 * @param id - The id of the animation to remove.
	 *
	 * @example
	 * Rotate the player then stop and reset the rotation after 1s.
	 * ```
	 * var r;
	 * r=skinViewer.animation.addAnimation((pl, pr) => {
	 * 	pl.rotation.x = pr;
	 * });
	 * setTimeout(()=>{
	 * 	skinViewer.animation.addAnimation((pl, pr,id) => {
	 * 		pl.rotation.x=0;
	 * 		skinViewer.animation.removeAnimation(id);
	 * 	})
	 * 	skinViewer.animation.removeAnimation(r);
	 * },1000)
	 * ```
	 */
	removeAnimation(id: number | undefined): void {
		if (id != undefined) {
			this.animationObjects.delete(id);
			this.progress0.delete(id);
		}
	}
}

/**
 * A class that helps you create an animation from a function.
 *
 * @example
 * To create an animation that rotates the player:
 * ```
 * new FunctionAnimation((player, progress) => player.rotation.y = progress)
 * ```
 */
export class FunctionAnimation extends PlayerAnimation {
	fn: (player: PlayerObject, progress: number, delta: number) => void;

	constructor(fn: (player: PlayerObject, progress: number, delta: number) => void) {
		super();
		this.fn = fn;
	}

	protected animate(player: PlayerObject, delta: number): void {
		this.fn(player, this.progress, delta);
	}
}

export class IdleAnimation extends PlayerAnimation {
	protected animate(player: PlayerObject): void {
		// Multiply by animation's natural speed
		const t = this.progress * 2;

		// Arm swing
		const basicArmRotationZ = Math.PI * 0.02;
		player.skin.leftArm.rotation.z = Math.cos(t) * 0.03 + basicArmRotationZ;
		player.skin.rightArm.rotation.z = Math.cos(t + Math.PI) * 0.03 - basicArmRotationZ;

		// Always add an angle for cape around the x axis
		const basicCapeRotationX = Math.PI * 0.06;
		player.cape.rotation.x = Math.sin(t) * 0.01 + basicCapeRotationX;
	}
}

export class WalkingAnimation extends PlayerAnimation {
	/**
	 * Whether to shake head when walking.
	 *
	 * @defaultValue `true`
	 */
	headBobbing: boolean = true;

	protected animate(player: PlayerObject): void {
		// Multiply by animation's natural speed
		const t = this.progress * 8;

		// Leg swing
		player.skin.leftLeg.rotation.x = Math.sin(t) * 0.5;
		player.skin.rightLeg.rotation.x = Math.sin(t + Math.PI) * 0.5;

		// Arm swing
		player.skin.leftArm.rotation.x = Math.sin(t + Math.PI) * 0.5;
		player.skin.rightArm.rotation.x = Math.sin(t) * 0.5;
		const basicArmRotationZ = Math.PI * 0.02;
		player.skin.leftArm.rotation.z = Math.cos(t) * 0.03 + basicArmRotationZ;
		player.skin.rightArm.rotation.z = Math.cos(t + Math.PI) * 0.03 - basicArmRotationZ;

		if (this.headBobbing) {
			// Head shaking with different frequency & amplitude
			player.skin.head.rotation.y = Math.sin(t / 4) * 0.2;
			player.skin.head.rotation.x = Math.sin(t / 5) * 0.1;
		} else {
			player.skin.head.rotation.y = 0;
			player.skin.head.rotation.x = 0;
		}

		// Always add an angle for cape around the x axis
		const basicCapeRotationX = Math.PI * 0.06;
		player.cape.rotation.x = Math.sin(t / 1.5) * 0.06 + basicCapeRotationX;
	}
}

export class RunningAnimation extends PlayerAnimation {
	protected animate(player: PlayerObject): void {
		// Multiply by animation's natural speed
		const t = this.progress * 15 + Math.PI * 0.5;

		// Leg swing with larger amplitude
		player.skin.leftLeg.rotation.x = Math.cos(t + Math.PI) * 1.3;
		player.skin.rightLeg.rotation.x = Math.cos(t) * 1.3;

		// Arm swing
		player.skin.leftArm.rotation.x = Math.cos(t) * 1.5;
		player.skin.rightArm.rotation.x = Math.cos(t + Math.PI) * 1.5;
		const basicArmRotationZ = Math.PI * 0.1;
		player.skin.leftArm.rotation.z = Math.cos(t) * 0.1 + basicArmRotationZ;
		player.skin.rightArm.rotation.z = Math.cos(t + Math.PI) * 0.1 - basicArmRotationZ;

		// Jumping
		player.position.y = Math.cos(t * 2);
		// Dodging when running
		player.position.x = Math.cos(t) * 0.15;
		// Slightly tilting when running
		player.rotation.z = Math.cos(t + Math.PI) * 0.01;
		// Apply higher swing frequency, lower amplitude,
		// and greater basic rotation around x axis,
		// to cape when running.
		const basicCapeRotationX = Math.PI * 0.3;
		player.cape.rotation.x = Math.sin(t * 2) * 0.1 + basicCapeRotationX;

		// What about head shaking?
		// You shouldn't glance right and left when running dude :P
	}
}

function clamp(num: number, min: number, max: number): number {
	return num <= min ? min : num >= max ? max : num;
}

export class FlyingAnimation extends PlayerAnimation {
	protected animate(player: PlayerObject): void {
		// Body rotation finishes in 0.5s
		// Elytra expansion finishes in 3.3s

		const t = this.progress > 0 ? this.progress * 20 : 0;
		const startProgress = clamp((t * t) / 100, 0, 1);

		player.rotation.x = (startProgress * Math.PI) / 2;
		player.skin.head.rotation.x = startProgress > 0.5 ? Math.PI / 4 - player.rotation.x : 0;

		const basicArmRotationZ = Math.PI * 0.25 * startProgress;
		player.skin.leftArm.rotation.z = basicArmRotationZ;
		player.skin.rightArm.rotation.z = -basicArmRotationZ;

		const elytraRotationX = 0.34906584;
		const elytraRotationZ = Math.PI / 2;
		const interpolation = Math.pow(0.9, t);
		player.elytra.leftWing.rotation.x = elytraRotationX + interpolation * (0.2617994 - elytraRotationX);
		player.elytra.leftWing.rotation.z = elytraRotationZ + interpolation * (0.2617994 - elytraRotationZ);
		player.elytra.updateRightWing();
	}
}

export class WaveAnimation extends PlayerAnimation {
	whichArm: string;

	constructor(whichArm: "left" | "right" = "left") {
		super();
		this.whichArm = whichArm;
	}

	protected animate(player: PlayerObject): void {
		const t = this.progress * 2 * Math.PI * 0.5;

		const targetArm = this.whichArm === "left" ? player.skin.leftArm : player.skin.rightArm;
		targetArm.rotation.x = 180;
		targetArm.rotation.z = Math.sin(t) * 0.5;
	}
}
export class CrouchAnimation extends PlayerAnimation {
	/**
	 * Whether to show the progress of animation.
	 * Because there is no progress in the crouch animation in Minecraft, the default value here is false.
	 * @defaultValue `false`
	 */
	showProgress: boolean = false;
	/**
	 * Whether to run this animation once.
	 *
	 * @defaultValue `false`
	 */
	runOnce: boolean = false;

	private isRunningHitAnimation: boolean = false;
	private hitAnimationSpeed: number = 1;
	/**
	 * Add the hit animation.
	 *
	 * @param speed - The speed of hit animation and the default is follow the speed of CrouchAnimation.But if the speed of CrouchAnimation is 0,this animation will not run.
	 */
	addHitAnimation(speed: number = this.speed): void {
		this.isRunningHitAnimation = true;
		this.hitAnimationSpeed = speed;
	}
	private erp: number = 0; //elytra rotate progress
	private isCrouched: boolean | undefined;
	protected animate(player: PlayerObject): void {
		let pr = this.progress * 8;
		if (pr === 0) {
			this.isCrouched = undefined;
		}
		if (this.runOnce) {
			pr = clamp(pr, -1, 1);
		}
		if (!this.showProgress) {
			pr = Math.floor(pr);
		}
		player.skin.body.rotation.x = 0.4537860552 * Math.abs(Math.sin((pr * Math.PI) / 2));
		player.skin.body.position.z =
			1.3256181 * Math.abs(Math.sin((pr * Math.PI) / 2)) - 3.4500310377 * Math.abs(Math.sin((pr * Math.PI) / 2));
		player.skin.body.position.y = -6 - 2.103677462 * Math.abs(Math.sin((pr * Math.PI) / 2));
		player.cape.position.y = 8 - 1.851236166577372 * Math.abs(Math.sin((pr * Math.PI) / 2));
		player.cape.rotation.x = (10.8 * Math.PI) / 180 + 0.294220265771 * Math.abs(Math.sin((pr * Math.PI) / 2));
		player.cape.position.z =
			-2 + 3.786619432 * Math.abs(Math.sin((pr * Math.PI) / 2)) - 3.4500310377 * Math.abs(Math.sin((pr * Math.PI) / 2));
		player.elytra.position.x = player.cape.position.x;
		player.elytra.position.y = player.cape.position.y;
		player.elytra.position.z = player.cape.position.z;
		player.elytra.rotation.x = player.cape.rotation.x - (10.8 * Math.PI) / 180;
		const pr1 = this.progress / this.speed;
		if (Math.abs(Math.sin((pr * Math.PI) / 2)) === 1 || (this.showProgress && Math.floor(Math.abs(pr)) % 2 === 0)) {
			this.erp = !this.isCrouched ? pr1 : this.erp;
			this.isCrouched = true;
			player.elytra.leftWing.rotation.z =
				0.26179944 + 0.4582006 * Math.abs(Math.sin((Math.min(pr1 - this.erp, 1) * Math.PI) / 2));
			player.elytra.leftWing.rotation.y = 0.3 * Math.abs(Math.sin((Math.min(pr1 - this.erp, 1) * Math.PI) / 2));
			player.elytra.updateRightWing();
		} else if (this.isCrouched !== undefined) {
			this.erp = this.isCrouched ? pr1 : this.erp;
			player.elytra.leftWing.rotation.z =
				0.72 - 0.4582006 * Math.abs(Math.sin((Math.min(pr1 - this.erp, 1) * Math.PI) / 2));
			player.elytra.leftWing.rotation.y = 0.3 - 0.3 * Math.abs(Math.sin((Math.min(pr1 - this.erp, 1) * Math.PI) / 2));
			player.elytra.updateRightWing();
			this.isCrouched = false;
		}
		player.skin.head.position.y = -3.618325234674 * Math.abs(Math.sin((pr * Math.PI) / 2));
		player.skin.leftArm.position.z =
			3.618325234674 * Math.abs(Math.sin((pr * Math.PI) / 2)) - 3.4500310377 * Math.abs(Math.sin((pr * Math.PI) / 2));
		player.skin.rightArm.position.z = player.skin.leftArm.position.z;
		player.skin.leftArm.rotation.x = 0.410367746202 * Math.abs(Math.sin((pr * Math.PI) / 2));
		player.skin.rightArm.rotation.x = player.skin.leftArm.rotation.x;
		player.skin.leftArm.rotation.z = 0.1;
		player.skin.rightArm.rotation.z = -player.skin.leftArm.rotation.z;
		player.skin.leftArm.position.y = -2 - 2.53943318 * Math.abs(Math.sin((pr * Math.PI) / 2));
		player.skin.rightArm.position.y = player.skin.leftArm.position.y;
		player.skin.rightLeg.position.z = -3.4500310377 * Math.abs(Math.sin((pr * Math.PI) / 2));
		player.skin.leftLeg.position.z = player.skin.rightLeg.position.z;
		if (this.isRunningHitAnimation) {
			const pr2 = this.progress;
			let t = (this.progress * 18 * this.hitAnimationSpeed) / this.speed;

			if (this.speed == 0) {
				t = 0;
			}

			const isCrouching = Math.abs(Math.sin((pr2 * Math.PI) / 2)) === 1;
			player.skin.rightArm.rotation.x =
				-0.4537860552 + 2 * Math.sin(t + Math.PI) * 0.3 - (isCrouching ? 0.4537860552 : 0);
			const basicArmRotationZ = 0.01 * Math.PI + 0.06;
			player.skin.rightArm.rotation.z = -Math.cos(t) * 0.403 + basicArmRotationZ;
			player.skin.body.rotation.y = -Math.cos(t) * 0.06;
			player.skin.leftArm.rotation.x = Math.sin(t + Math.PI) * 0.077 + (isCrouching ? 0.47 : 0);
			player.skin.leftArm.rotation.z = -Math.cos(t) * 0.015 + 0.13 - (!isCrouching ? 0.05 : 0);
			if (!isCrouching) {
				player.skin.leftArm.position.z = Math.cos(t) * 0.3;
				player.skin.leftArm.position.x = 5 - Math.cos(t) * 0.05;
			}
		}
	}
}
export class HitAnimation extends PlayerAnimation {
	protected animate(player: PlayerObject): void {
		const t = this.progress * 18;
		player.skin.rightArm.rotation.x = -0.4537860552 * 2 + 2 * Math.sin(t + Math.PI) * 0.3;
		const basicArmRotationZ = 0.01 * Math.PI + 0.06;
		player.skin.rightArm.rotation.z = -Math.cos(t) * 0.403 + basicArmRotationZ;
		player.skin.body.rotation.y = -Math.cos(t) * 0.06;
		player.skin.leftArm.rotation.x = Math.sin(t + Math.PI) * 0.077;
		player.skin.leftArm.rotation.z = -Math.cos(t) * 0.015 + 0.13 - 0.05;
		player.skin.leftArm.position.z = Math.cos(t) * 0.3;
		player.skin.leftArm.position.x = 5 - Math.cos(t) * 0.05;
	}
}

export class SwimAnimation extends PlayerAnimation {
	private lock: boolean = false;
	protected animate(player: PlayerObject): void {
		if (this.progress === 0) {
			this.lock = false;
		}
		const period = 1.3;
		const t = this.progress % period;
		const phase = t / period;
		// keyframe timing points
		const times = [0, 0.7 / period, 1.1 / period, 1.0];
		const leftEulerDeg = [
			{ z: 180, y: 180, x: 0 },
			{ z: 287.2, y: 180, x: 0 },
			{ z: 180, y: 180, x: 90 },
			{ z: 180, y: 180, x: 0 },
		];
		const rightEulerDeg = [
			{ z: -180, y: 180, x: 0 },
			{ z: -287.2, y: 180, x: 0 },
			{ z: -180, y: 180, x: 90 },
			{ z: -180, y: 180, x: 0 },
		];

		const toRad = Math.PI / 180;

		function eulerZYXToQuat(z: number, y: number, x: number) {
			const qz = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), z);
			const qy = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), y);
			const qx = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), x);
			return qx.multiply(qy).multiply(qz);
		}

		const leftQuats = leftEulerDeg.map(e => eulerZYXToQuat(e.z * toRad, e.y * toRad, e.x * toRad));
		const rightQuats = rightEulerDeg.map(e => eulerZYXToQuat(e.z * toRad, e.y * toRad, e.x * toRad));

		function findSegment(t: number) {
			for (let i = 0; i < times.length - 1; i++) {
				if (t >= times[i] && t <= times[i + 1]) {
					return { i, t0: times[i], t1: times[i + 1] };
				}
			}
			return { i: times.length - 2, t0: times[times.length - 2], t1: times[times.length - 1] };
		}

		const seg = findSegment(phase);
		const p = (phase - seg.t0) / (seg.t1 - seg.t0);
		const i = seg.i;
		if (!this.lock) {
			let k = 1.3;
			if (i == 0 && p * k < 1) {
				player.position.y = -5 * p * k;
				player.rotation.x = (1.3 * p * Math.PI) / 2;
				player.skin.head.rotation.x = (-Math.PI / 4) * p * k;
				player.cape.rotation.x = (Math.PI / 4) * p * k;
			} else {
				this.lock = true;
			}
		}
		const qLeft = new Quaternion().copy(leftQuats[i]).slerp(leftQuats[i + 1], p);
		const qRight = new Quaternion().copy(rightQuats[i]).slerp(rightQuats[i + 1], p);

		player.skin.leftArm.quaternion.copy(qLeft);
		player.skin.rightArm.quaternion.copy(qRight);
		const legFreq = 390 * toRad;
		const legAmp = 17.2 * toRad;
		const leftLegX = legAmp * Math.cos(this.progress * legFreq + Math.PI);
		const rightLegX = legAmp * Math.cos(this.progress * legFreq);
		player.skin.leftLeg.rotation.x = leftLegX;
		player.skin.leftLeg.rotation.y = -0.1 * toRad;
		player.skin.leftLeg.rotation.z = -0.1 * toRad;
		player.skin.rightLeg.rotation.x = rightLegX;
		player.skin.rightLeg.rotation.y = 0.1 * toRad;
		player.skin.rightLeg.rotation.z = 0.1 * toRad;
	}
}
