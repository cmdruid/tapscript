import { Buff }            from '@cmdcode/buff-utils'
import { Bytes, Networks } from '../../schema/types.js'
import { checkSize }       from '../utils.js'
import { hash160pkh }      from './hash.js'

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
  input   : Bytes,
  network : Networks = 'main'
) : string {
  const bytes  = Buff.bytes(input)
  const prefix = (network === 'main') ? Buff.num(0x00) : Buff.num(0x6F)
  checkSize(input, 20)
  return bytes.prepend(prefix).tob58chk()
}

export function decode (
  address : string,
  network : Networks = 'main'
) : Buff {
  if (!check(address, network)) {
    throw new TypeError('Invalid p2pkh address!')
  }
  return Buff.b58chk(address).slice(1)
}

export function scriptPubKey (input : Bytes) : string[] {
  const bytes = Buff.bytes(input)
  checkSize(bytes, 20)
  return [ 'OP_DUP', 'OP_HASH160', bytes.hex, 'OP_EQUALVERIFY', 'OP_CHECKSIG' ]
}

export function fromPubKey (
  pubkey   : Bytes,
  network ?: Networks
) : string {
  const pkh = hash160pkh(pubkey)
  return encode(pkh, network)
}

export const P2PKH = { check, encode, decode, hash: hash160pkh, scriptPubKey, fromPubKey }
