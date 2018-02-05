import * as THREE from 'three'
import { CompositeAnimation, WalkAnimation } from './animation'
import { Animation } from './animation'
import { PlayerObject } from './model'

interface SkinViewerOptions {
  domElement: Element
  animation?: Animation
  slim?: boolean
  skinUrl?: string
  capeUrl?: string
  width?: number
  height?: number
}

export class SkinViewer {
  skinUrl: string
  capeUrl: string
  width: number
  height: number
  readonly domElement: Element
  animation: Animation
  animationPaused: boolean
  animationTime: number
  readonly playerObject: PlayerObject
  readonly disposed: boolean
  readonly camera: THREE.Camera
  readonly renderer: THREE.Renderer
  readonly scene: THREE.Scene

  constructor(options: SkinViewerOptions)

  setSize(width: number, height: number): void

  dispose(): void
}

export class SkinControl {
  enableAnimationControl: boolean
  readonly skinViewer: SkinViewer

  constructor(skinViewer: SkinViewer)

  dispose(): void
}
