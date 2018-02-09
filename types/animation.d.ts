import { PlayerObject } from "./model";

type AnimationFn = (player: PlayerObject, time: number) => void;
interface IAnimation {
	play(player: PlayerObject, time: number): void;
}
export type Animation = AnimationFn | IAnimation;

declare function invokeAnimation(
	animation: Animation,
	player: PlayerObject,
	time: number,
): void;

declare class AnimationHandle implements IAnimation {
	readonly animation: Animation;
	paused: boolean;
	speed: number;

	constructor(animation: Animation);

	play(player: PlayerObject, time: number): void;

	reset(): void;
}

export class CompositeAnimation implements IAnimation {
	private handles: Set<AnimationHandle>;

	constructor();

	add(animation: Animation): AnimationHandle;

	play(player: PlayerObject, time: number): void;
}

export const WalkAnimation: AnimationFn;
