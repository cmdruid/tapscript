import { Buff, Bytes } from '@cmdcode/buff'
import { convert_32b } from '@cmdcode/crypto-tools/keys'
import { assert }      from '@/util/index.js'

import type { Networks } from '@/types/index.js'

import CONST from '../const.js'

const VALID_PREFIXES = [ 'bc1p', 'tb1p', 'bcrt1p' ]

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
  const bytes  = Buff.bytes(input)
  assert.size(bytes, 32)
  return bytes.to_bech32m(prefix)
}

export function decode (address : string) : Buff {
  if (!check(address)) {
    throw new TypeError('Invalid taproot address!')
  }
  return Buff.bech32(address)
}

export function scriptPubKey (input : Bytes) : string[] {
  const bytes = Buff.bytes(input)
  assert.size(bytes, 32)
  return [ 'OP_1', bytes.hex ]
}

export function fromPubKey (
  pubkey   : Bytes,
  network ?: Networks
) : string {
  const bytes = convert_32b(pubkey)
  return encode(bytes, network)
}

export const P2TR = { check, encode, decode, scriptPubKey, fromPubKey }
