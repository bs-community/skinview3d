import { PlayerObject } from "./model";
export interface IAnimation {
    play(player: PlayerObject, time: number): void;
}
export declare type AnimationFn = (player: PlayerObject, time: number) => void;
export declare type Animation = AnimationFn | IAnimation;
export declare function invokeAnimation(animation: Animation, player: PlayerObject, time: number): void;
export interface AnimationHandle {
    paused: boolean;
    speed: number;
    readonly animation: Animation;
    reset(): void;
    remove(): void;
}
export declare class CompositeAnimation implements IAnimation {
    readonly handles: Set<AnimationHandle & IAnimation>;
    add(animation: Animation): AnimationHandle;
    play(player: PlayerObject, time: number): void;
}
export declare const WalkingAnimation: Animation;
export declare const RunningAnimation: Animation;
export declare const RotatingAnimation: Animation;
