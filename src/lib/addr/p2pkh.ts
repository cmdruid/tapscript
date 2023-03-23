import { Buff, Bytes } from '@cmdcode/buff-utils'
import { Networks } from '../../schema/types.js'

export function check (
  address : string,
  network : Networks = 'main'
) : boolean {
  const prefixes = (network === 'main') ? [ '1' ] : [ 'm', 'n' ]

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
  const prefix = (network === 'main') ? Buff.num(0x00) : Buff.num(0x6F)
  const bytes  = Buff.bytes(key).prepend(prefix)
  return bytes.toHash('hash160').tob58check()
}

export function decode (
  address : string,
  network : Networks = 'main'
) : Buff {
  if (!check(address, network)) {
    throw new TypeError('Invalid p2pkh address!')
  }
  return Buff.b58check(address)
}

export function script (key : string) : string[] {
  return [ 'OP_DUP', 'OP_HASH160', key, 'OP_EQUALVERIFY', 'OP_CHECKSIG' ]
}

export const P2PKH = { check, encode, decode, script }
