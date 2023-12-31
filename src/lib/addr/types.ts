import { Buff, Bytes } from '@cmdcode/buff'

import { Network, ScriptData, ScriptWord } from '../../types/index.js'

export type AddrEnum = 'p2pkh' | 'p2sh' | 'p2w-pkh' | 'p2w-sh' | 'p2tr'

export interface DecoderTool {
  base58  : (str : string) => Buff
  bech32  : (str : string) => DecodedData
  bech32m : (str : string) => DecodedData
}

export interface DecodedData {
  data    : Buff
  prefix  : string
  version : number
}

export type AddressType = [
  type    : AddrEnum,
  prefix  : string,
  network : Network,
  size    : number,
  format  : 'base58' | 'bech32' | 'bech32m'
]

export interface AddressMeta {
  type    : AddrEnum
  prefix  : string
  network : Network
  size    : number
  format  : 'base58' | 'bech32' | 'bech32m'
}

export interface AddressData {
  hex  : string
  key  : string
  net  : Network
  asm  : ScriptWord[]
  type : AddrEnum
}

export interface AddressTool {
  create : (input   : ScriptData, network ?: Network) => string
  encode : (keydata : Bytes,      network ?: Network) => string
  decode : (address : string,     network ?: Network) => AddressData
}
