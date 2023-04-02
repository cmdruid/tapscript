/* eslint-disable quote-props */

import { Buff, Bytes } from '@cmdcode/buff-utils'
import { Networks, ScriptData } from '../../schema/types.js'

export type AddressType = [
  prefix  : string,
  type    : keyof AddressTools,
  network : Networks,
  tool    : KeyTool | ScriptTool
]

export interface AddressTool {
  check  : (address : string, network ?: Networks) => boolean
  decode : (address : string, network ?: Networks) => Buff
  script : (hash    : string) => string[]
}

export interface KeyTool extends AddressTool {
  encode : (key : Bytes,  network ?: Networks) => string
}

export interface ScriptTool extends AddressTool {
  encode : (script : ScriptData, network ?: Networks) => string
}

export interface AddressTools {
  p2pkh : KeyTool
  p2sh  : ScriptTool
  p2w   : KeyTool
  p2tr  : KeyTool
}

export const BECH32_PREFIXES : Record<Networks, string> = {
  main    : 'bc',
  testnet : 'tb',
  signet  : 'tb',
  regtest : 'bcrt'
}
