import * as THREE from 'three'

type Material = THREE.Material | THREE.Material[]

export class SkinObject extends THREE.Group {
  head: THREE.Group
  body: THREE.Group
  rightArm: THREE.Group
  leftArm: THREE.Group
  rightLeg: THREE.Group
  leftLeg: THREE.Group

  constructor(
    isSlim: boolean,
    layer1Material: Material,
    layer2Material: Material
  )
}

export class CapeObject extends THREE.Group {
  cape: THREE.Mesh

  constructor(capeMaterial: Material)
}

export class PlayerObject extends THREE.Group {
  slim: boolean
  skin: SkinObject
  cape: CapeObject

  constructor(
    isSlim: boolean,
    layer1Material: Material,
    layer2Material: Material,
    capeMaterial: Material
  )
}
