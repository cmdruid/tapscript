import { Bytes }      from '@cmdcode/buff'
import { ScriptData } from './script.js'

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

export type TapTree = Array<string | string[]>

export type TapProof = [
  root   : string,
  target : string | undefined,
  path   : string[]
]
