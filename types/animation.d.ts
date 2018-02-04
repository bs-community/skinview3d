import { PlayerObject } from './model'

export type Animation = CompositeAnimation | typeof WalkAnimation

declare function invokeAnimation(
  animation: Animation,
  player: PlayerObject,
  time: number
): void

declare class AnimationHandle {
  animation: Animation
  paused: boolean
  speed: number

  constructor(animation: Animation)

  play(player: PlayerObject, time: number): void

  reset(): void
}

export class CompositeAnimation {
  handles: Set<AnimationHandle>

  constructor()

  add(animation: Animation): AnimationHandle

  play(player: PlayerObject, time: number): void
}

export function WalkAnimation(player: PlayerObject, time: number): void
