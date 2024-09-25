import { Buff, Bytes } from '@cmdcode/buff'
import { assert }      from '@/util/index.js'
import { sha256sh }    from './util.js'

import type { Networks, ScriptData } from '@/types/index.js'

import CONST from '../const.js'


const VALID_PREFIXES = [ 'bc1q', 'tb1q', 'bcrt1q' ]

export function check (address : string) : boolean {
  for (const prefix of VALID_PREFIXES) {
    if (address.startsWith(prefix)) {
      return true
    }
  }
  return false
}

export function encode (
  input   : Bytes,
  network : Networks = 'main'
) : string {
  const prefix = CONST.BECH32_PREFIXES[network]
  const bytes = Buff.bytes(input)
  assert.size(bytes, 32)
  return bytes.to_bech32(prefix)
}

export function decode (address : string) : Buff {
  if (!check(address)) {
    throw new TypeError('Invalid segwit address!')
  }
  return Buff.bech32(address)
}

export function scriptPubKey (input : Bytes) : string[] {
  const bytes = Buff.bytes(input)
  assert.size(bytes, 32)
  return [ 'OP_0', bytes.hex ]
}

export function fromScript (
  script   : ScriptData,
  network ?: Networks
) : string {
  const sh = sha256sh(script)
  return encode(sh, network)
}

export const P2WSH = { check, encode, decode, hash: sha256sh, scriptPubKey, fromScript }
