/* eslint-disable quote-props */

import { Buff } from '@cmdcode/buff'
import { Bytes, Networks, OutputType, ScriptData } from '../../schema/types.js'

export type AddressType = [
  prefix  : string,
  type    : OutputType,
  network : Networks,
  size    : number,
  format  : 'base58' | 'bech32' | 'bech32m'
]

export interface AddressData {
  data    : Buff
  network : Networks
  prefix  : string
  script  : string[]
  type    : OutputType
}

export interface AddressTool {
  check  : (address : string, network ?: Networks) => boolean
  encode : (input   : Bytes, network ?: Networks) => string
  decode : (address : string, network ?: Networks) => Buff
  scriptPubKey : (keyhash : Bytes) => string[]
}

export interface AddrKeyTool extends AddressTool {
  fromPubKey : (pubkey : Bytes, network ?: Networks) => string
}

export interface AddrScriptTool extends AddressTool {
  fromScript : (script : ScriptData, network ?: Networks) => string
}

export const BECH32_PREFIXES : Record<Networks, string> = {
  main    : 'bc',
  testnet : 'tb',
  signet  : 'tb',
  regtest : 'bcrt'
}
