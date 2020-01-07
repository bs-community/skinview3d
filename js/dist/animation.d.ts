import { Clock } from "three";
import { PlayerObject } from "./model";
export interface IAnimation {
    play(player: PlayerObject, time: number): void;
}
export declare type AnimationFn = (player: PlayerObject, time: number) => void;
export declare type Animation = AnimationFn | IAnimation;
export declare function invokeAnimation(animation: Animation, player: PlayerObject, time: number): void;
export interface AnimationHandle {
    speed: number;
    paused: boolean;
    progress: number;
    readonly animation: Animation;
    reset(): void;
}
export interface SubAnimationHandle extends AnimationHandle {
    remove(): void;
    resetAndRemove(): void;
}
export declare class CompositeAnimation implements IAnimation {
    readonly handles: Set<AnimationHandle & IAnimation>;
    add(animation: Animation): AnimationHandle;
    play(player: PlayerObject, time: number): void;
}
export declare class RootAnimation extends CompositeAnimation implements AnimationHandle {
    speed: number;
    progress: number;
    readonly clock: Clock;
    get animation(): this;
    get paused(): boolean;
    set paused(value: boolean);
    runAnimationLoop(player: PlayerObject): void;
    reset(): void;
}
export declare const WalkingAnimation: Animation;
export declare const RunningAnimation: Animation;
export declare const RotatingAnimation: Animation;
