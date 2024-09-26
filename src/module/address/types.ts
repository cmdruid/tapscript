import { Buff, Bytes } from '@cmdcode/buff'

import type { Networks, OutputType, ScriptData } from '@/types/index.js'

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
