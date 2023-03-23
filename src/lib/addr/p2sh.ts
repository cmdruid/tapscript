import { Buff, Bytes } from '@cmdcode/buff-utils'
import { Networks }    from '../../schema/types.js'

export function check (
  address : string,
  network : Networks = 'main'
) : boolean {
  const prefixes = (network === 'main') ? [ '3' ] : [ '2' ]

  for (const prefix of prefixes) {
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
  const prefix = (network === 'main') ? Buff.num(0x05) : Buff.num(0xC4)
  const bytes  = Buff.bytes(key).prepend(prefix)
  return bytes.toHash('hash160').tob58check()
}

export function decode (
  address : string,
  network : Networks = 'main'
) : Buff {
  if (!check(address, network)) {
    throw new TypeError('Invalid p2sh address!')
  }
  return Buff.b58check(address)
}

export function script (key : string) : string[] {
  return [ 'OP_HASH160', key, 'OP_EQUAL' ]
}

export const P2SH = { check, encode, decode, script }
