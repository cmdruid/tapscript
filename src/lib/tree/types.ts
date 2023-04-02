export type TapKey = [
  key    : string,
  parity : number
]

export type TapTree = Array<string | string[]>

export type TapProof = [
  root   : string,
  target : string | null,
  path   : string[]
]

export interface ProofConfig {
  version ?: number
  parity  ?: 0 | 1
  tree    ?: TapTree
}
