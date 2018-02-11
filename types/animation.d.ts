import { PlayerObject } from "./model";

export interface IAnimation {
	play(player: PlayerObject, time: number): void;
}
export type AnimationFn = (player: PlayerObject, time: number) => void;
export type Animation = AnimationFn | IAnimation;

export function invokeAnimation(
	animation: Animation,
	player: PlayerObject,
	time: number,
): void;

export interface AnimationHandle extends IAnimation {
	readonly animation: Animation;
	paused: boolean;
	speed: number;

	reset(): void;
}

export class CompositeAnimation implements IAnimation {
	constructor();

	public add(animation: Animation): AnimationHandle;

	public play(player: PlayerObject, time: number): void;
}

export const WalkAnimation: AnimationFn;
export const RunningAnimation: AnimationFn;
export const RotatingAnimation: AnimationFn;
