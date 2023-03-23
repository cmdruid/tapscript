import { Buff, Bytes }     from '@cmdcode/buff-utils'
import { Networks }        from '../../schema/types.js'
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
  const bytes  = Buff.bytes(key)
  const prefix = BECH32_PREFIXES[network]
  if (bytes.length !== 32) {
    throw new Error('Key length is an invalid size: ' + String(bytes.length))
  }
  return bytes.toBech32(prefix, 1)
}

export function decode (address : string) : Buff {
  if (!check(address)) {
    throw new TypeError('Invalid taproot address!')
  }
  return Buff.bech32(address, 1)
}

export function script (key : string) : string[] {
  return [ '51', key ]
}

export const P2TR = { check, encode, decode, script }
