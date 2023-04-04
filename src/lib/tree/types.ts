export type TapKey = [
  key    : string,
  cblock : string
]

export interface TapConfig {
  version   ?: number
  tree      ?: TapTree
  isPrivate ?: boolean
  throws    ?: boolean
}

export interface CtrlBlock {
  version : number
  parity  : number
  intkey  : Uint8Array
  paths   : string[]
}

export type TapTree = Array<string | string[]>

export type TapProof = [
  root   : string,
  target : string | null,
  path   : string[]
]
