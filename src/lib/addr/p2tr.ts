import { Buff } from '@cmdcode/buff-utils'
import { Bytes, Networks } from '../../schema/types.js'
import { BECH32_PREFIXES } from './schema.js'

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
  key : Bytes,
  network : Networks = 'main'
) : string {
  const prefix = BECH32_PREFIXES[network]
  const bytes  = validate(key)
  return bytes.toBech32(prefix, 1)
}

export function decode (address : string) : Buff {
  if (!check(address)) {
    throw new TypeError('Invalid taproot address!')
  }
  return Buff.bech32(address)
}

export function script (key : Bytes) : string[] {
  const bytes  = validate(key)
  return [ 'OP_1', bytes.hex ]
}

function validate (key : Bytes) : Buff {
  const bytes = Buff.bytes(key)
  if (bytes.length !== 32) {
    throw new Error('Key length is an invalid size: ' + String(bytes.length))
  }
  return bytes
}

export const P2TR = { check, encode, decode, script }
