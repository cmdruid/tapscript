import { Buff, Bytes }     from '@cmdcode/buff-utils'
import { Networks }        from '../../schema/types.js'
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
  let bytes = Buff.bytes(key)
  const prefix = BECH32_PREFIXES[network]
  if (bytes.length !== 33 && bytes.length !== 32) {
    throw new Error('Key length is an invalid size: ' + String(bytes.length))
  }
  if (bytes.length === 33) bytes = bytes.toHash('hash160')
  return bytes.toBech32(prefix, 0)
}

export function decode (address : string) : Buff {
  if (!check(address)) {
    throw new TypeError('Invalid segwit address!')
  }
  return Buff.bech32(address)
}

export function script (key : string) : string[] {
  return [ '00', key ]
}

export const P2W = { check, encode, decode, script }
