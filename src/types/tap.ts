import { Bytes } from '@cmdcode/buff'

import {
  ScriptData,
  ScriptWord
} from './script.js'

export interface TapContext extends CtrlBlock {
  data      ?: Bytes
  tapkey     : string
  cblock     : string
  extension ?: string
  script    ?: ScriptData
  taproot   ?: string
  taptree    : TapTree
  taptweak   : string
}

export interface TapConfig {
  data      ?: Bytes
  script    ?: ScriptData
  tapleaf   ?: Bytes
  taptree   ?: TapTree
  throws    ?: boolean
  version   ?: number
}

export interface CtrlBlock {
  int_pub  : string
  parity   : number
  path     : string[]
  version  : number
}

export interface ProofData {
  cblock : CtrlBlock
  params : Bytes[]
  script : ScriptWord[]
  tapkey : Bytes
  tweak  : Bytes
}

export type TapTree = Array<string | string[]>

export type MerkleProof = [
  root   : string,
  target : string | undefined,
  path   : string[]
]
