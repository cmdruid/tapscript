import { Buff }            from '@cmdcode/buff-utils'
import { Bytes, Networks } from '../../schema/types.js'
import { BECH32_PREFIXES } from './schema.js'

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
  key     : Bytes,
  network : Networks = 'main'
) : string {
  const prefix = BECH32_PREFIXES[network]
  const bytes  = convert(key)
  return bytes.toBech32(prefix, 0)
}

export function decode (address : string) : Buff {
  if (!check(address)) {
    throw new TypeError('Invalid segwit address!')
  }
  return Buff.bech32(address)
}

export function script (keyhash : Bytes) : string[] {
  const bytes = Buff.bytes(keyhash)
  return [ 'OP_0', bytes.hex ]
}

function convert (key : Bytes) : Buff {
  const bytes = Buff.bytes(key)
  if (bytes.length === 33) {
    return bytes.toHash('hash160')
  }
  if (bytes.length === 32) {
    return bytes
  }
  throw new Error('Key length is an invalid size: ' + String(bytes.length))
}

export const P2W = { check, encode, decode, script }
