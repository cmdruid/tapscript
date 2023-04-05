import { Buff } from '@cmdcode/buff-utils'
import { Bytes, Networks } from '../../schema/types.js'

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
  const bytes  = Buff.bytes(key)
  const prefix = (network === 'main') ? Buff.num(0x00) : Buff.num(0x6F)
  if (bytes.length !== 33) {
    throw new Error('Invalid key size: ' + String(bytes.length))
  }
  return bytes.toHash('hash160').prepend(prefix).tob58check()
}

export function decode (
  address : string,
  network : Networks = 'main'
) : Buff {
  if (!check(address, network)) {
    throw new TypeError('Invalid p2pkh address!')
  }
  return Buff.b58check(address).slice(1)
}

export function script (keyhash : Bytes) : string[] {
  const bytes = Buff.bytes(keyhash)
  return [ 'OP_DUP', 'OP_HASH160', bytes.hex, 'OP_EQUALVERIFY', 'OP_CHECKSIG' ]
}

export const P2PKH = { check, encode, decode, script }
