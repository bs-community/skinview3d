import { PlayerObject } from './model'

declare function invokeAnimation(
  animation: CompositeAnimation,
  player: PlayerObject,
  time: number
): void

declare function invokeAnimation(
  animation: typeof WalkAnimation,
  player: PlayerObject,
  time: number
): void

declare class AnimationHandle {
  animation: typeof WalkAnimation
  paused: boolean
  speed: number

  constructor(animation: typeof WalkAnimation)

  play(player: PlayerObject, time: number): void

  reset(): void
}

export class CompositeAnimation {
  handles: Set<AnimationHandle>

  constructor()

  add(animation: typeof WalkAnimation): AnimationHandle

  play(player: PlayerObject, time: number): void
}

export function WalkAnimation(player: PlayerObject, time: number): void
