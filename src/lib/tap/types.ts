import { Buff } from '@cmdcode/buff-utils'
import { Bytes, ScriptData } from '../../schema/types.js'

export type TapKey = [
  key    : string,
  cblock : string
]

export interface TapConfig {
  data      ?: Bytes
  isPrivate ?: boolean
  script    ?: ScriptData
  tapleaf   ?: Bytes
  target    ?: Bytes
  throws    ?: boolean
  tree      ?: TapTree
  version   ?: number
}

export interface CtrlBlock {
  version : number
  parity  : number
  intkey  : Buff
  paths   : string[]
}

export type TapTree = Array<string | string[]>

export type TapProof = [
  root   : string,
  target : string | undefined,
  path   : string[]
]
