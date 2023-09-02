import { Bytes }      from '@cmdcode/buff-utils'
import { ScriptData } from './script.js'

export interface TapKey extends CtrlBlock {
  tapkey   : string
  cblock   : string
  target  ?: string
  taptweak : string
}

export interface TapConfig {
  data      ?: Bytes
  is_secret ?: boolean
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
  int_pub : string
  path    : string[]
  target ?: string
}

export type TapTree = Array<string | string[]>

export type TapProof = [
  root   : string,
  target : string | undefined,
  path   : string[]
]
