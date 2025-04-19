import { PlayerObject } from "./model.js";

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
		this.progress += delta;
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

    constructor(whichArm: 'left' | 'right' = 'left') {
        super();
        this.whichArm = whichArm;
    }

    protected animate(player: PlayerObject): void {
        const t = this.progress * 2 * Math.PI * 0.5;

        const targetArm = this.whichArm === 'left' ? player.skin.leftArm : player.skin.rightArm;
        targetArm.rotation.x = 180
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
   * @param - speed (Default is follow the speed of CrouchAnimation.But is the speed of CrouchAnimation is 0,this animation will not run.)
   */
  addHitAnimation(speed: number = this.speed): void {
    this.isRunningHitAnimation = true;
    this.hitAnimationSpeed = speed;
  }
  private erp: nomber = 0; //elytra rotate progress
  private isCrouched: any;
  protected animate(player: PlayerObject): void {
    var pr = this.progress * 8;
    if (pr === 0) {
      this.isCrouched = undefined;
    }
    if (this.runOnce) {
      if (pr > 1) {
        pr = 1;
      }
    }
    if (!this.showProgress) {
      pr = Math.floor(pr);
    }
    player.skin.body.rotation.x =
      0.4537860552 * Math.abs(Math.sin((pr * Math.PI) / 2));
    player.skin.body.position.z =
      1.3256181 * Math.abs(Math.sin((pr * Math.PI) / 2)) -
      3.4500310377 * Math.abs(Math.sin((pr * Math.PI) / 2));
    player.skin.body.position.y =
      -6 - 2.103677462 * Math.abs(Math.sin((pr * Math.PI) / 2));
    player.cape.position.y =
      8 - 1.851236166577372 * Math.abs(Math.sin((pr * Math.PI) / 2));
    player.cape.rotation.x =
      (10.8 * Math.PI) / 180 +
      0.294220265771 * Math.abs(Math.sin((pr * Math.PI) / 2));
    player.cape.position.z =
      -2 +
      3.786619432 * Math.abs(Math.sin((pr * Math.PI) / 2)) -
      3.4500310377 * Math.abs(Math.sin((pr * Math.PI) / 2));
    player.elytra.position.x = player.cape.position.x;
    player.elytra.position.y = player.cape.position.y;
    player.elytra.position.z = player.cape.position.z;
    player.elytra.rotation.x = player.cape.rotation.x - (10.8 * Math.PI) / 180;
    var pr1 = this.progress / this.speed;
    if (Math.abs(Math.sin((pr * Math.PI) / 2)) === 1) {
      this.erp = !this.isCrouched ? pr1 : this.erp;
      this.isCrouched = true;
      player.elytra.leftWing.rotation.z =
        0.26179944 +
        0.4582006 *
          Math.abs(Math.sin((Math.min(pr1 - this.erp, 1) * Math.PI) / 2));
      player.elytra.updateRightWing();
    } else if (this.isCrouched !== undefined) {
      this.erp = this.isCrouched ? pr1 : this.erp;
      player.elytra.leftWing.rotation.z =
        0.72 -
        0.4582006 *
          Math.abs(Math.sin((Math.min(pr1 - this.erp, 1) * Math.PI) / 2));
      player.elytra.updateRightWing();
      this.isCrouched = false;
    }
    player.skin.head.position.y =
      -3.618325234674 * Math.abs(Math.sin((pr * Math.PI) / 2));
    player.skin.leftArm.position.z =
      3.618325234674 * Math.abs(Math.sin((pr * Math.PI) / 2)) -
      3.4500310377 * Math.abs(Math.sin((pr * Math.PI) / 2));
    player.skin.rightArm.position.z = player.skin.leftArm.position.z;
    player.skin.leftArm.rotation.x =
      0.410367746202 * Math.abs(Math.sin((pr * Math.PI) / 2));
    player.skin.rightArm.rotation.x = player.skin.leftArm.rotation.x;
    player.skin.leftArm.rotation.z = 0.1;
    player.skin.rightArm.rotation.z = -player.skin.leftArm.rotation.z;
    player.skin.leftArm.position.y =
      -2 - 2.53943318 * Math.abs(Math.sin((pr * Math.PI) / 2));
    player.skin.rightArm.position.y = player.skin.leftArm.position.y;
    player.skin.rightLeg.position.z =
      -3.4500310377 * Math.abs(Math.sin((pr * Math.PI) / 2));
    player.skin.leftLeg.position.z = player.skin.rightLeg.position.z;
    if (this.isRunningHitAnimation) {
      var pr = this.progress;
      var t = (this.progress * 18 * this.hitAnimationSpeed) / this.speed;
      if (this.speed === 0) {
        t = 0;
      }
      var isCrouching = Math.abs(Math.sin((pr * Math.PI) / 2)) === 1;
      player.skin.rightArm.rotation.x =
        -0.4537860552 +
        2 * Math.sin(t + Math.PI) * 0.3 -
        (isCrouching ? 0.4537860552 : 0);
      const basicArmRotationZ = 0.01 * Math.PI + 0.06;
      player.skin.rightArm.rotation.z =
        -Math.cos(t) * 0.403 + basicArmRotationZ;
      player.skin.body.rotation.y = -Math.cos(t) * 0.06;
      player.skin.leftArm.rotation.x =
        Math.sin(t + Math.PI) * 0.077 + (isCrouching ? 0.47 : 0);
      player.skin.leftArm.rotation.z =
        -Math.cos(t) * 0.015 + 0.13 - (!isCrouching ? 0.05 : 0);
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
    player.skin.rightArm.rotation.x =
      -0.4537860552 * 2 + 2 * Math.sin(t + Math.PI) * 0.3;
    const basicArmRotationZ = 0.01 * Math.PI + 0.06;
    player.skin.rightArm.rotation.z = -Math.cos(t) * 0.403 + basicArmRotationZ;
    player.skin.body.rotation.y = -Math.cos(t) * 0.06;
    player.skin.leftArm.rotation.x = Math.sin(t + Math.PI) * 0.077;
    player.skin.leftArm.rotation.z = -Math.cos(t) * 0.015 + 0.13 - 0.05;
    player.skin.leftArm.position.z = Math.cos(t) * 0.3;
    player.skin.leftArm.position.x = 5 - Math.cos(t) * 0.05;
  }
}
