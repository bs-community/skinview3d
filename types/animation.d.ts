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
	public readonly animation: Animation;
	public paused: boolean;
	public speed: number;

	constructor(animation: Animation);

	public play(player: PlayerObject, time: number): void;

	public reset(): void;
}

export class CompositeAnimation implements IAnimation {
	private handles: Set<AnimationHandle>;

	constructor();

	public add(animation: Animation): AnimationHandle;

	public play(player: PlayerObject, time: number): void;
}

export const WalkAnimation: AnimationFn;
