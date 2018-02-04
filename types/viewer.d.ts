import { CompositeAnimation, WalkAnimation } from './animation';

interface SkinViewerOptions {
  domElement: Element
  animation?: CompositeAnimation | typeof WalkAnimation
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

  constructor(options: SkinViewerOptions)

  setSize(width: number, height: number): void

  dispose(): void
}

export class SkinControl {
  constructor(skinViewer: SkinViewer)

  dispose(): void
}
