import { Buff } from '@cmdcode/buff-utils'
import { Bytes, Networks, ScriptData } from '../../schema/types.js'
import { Script } from '../script/index.js'

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
  script  : ScriptData,
  network : Networks = 'main'
) : string {
  const prefix = (network === 'main') ? Buff.num(0x05) : Buff.num(0xC4)
  const bytes = Script.encode(script, false)
  const hash  = Buff.bytes(bytes).toHash('hash160')
  return hash.prepend(prefix).tob58check()
}

export function decode (
  address : string,
  network : Networks = 'main'
) : Buff {
  if (!check(address, network)) {
    throw new TypeError('Invalid p2sh address!')
  }
  return Buff.b58check(address).slice(1)
}

export function script (keyhash : Bytes) : string[] {
  const bytes = Buff.bytes(keyhash)
  return [ 'OP_HASH160', bytes.hex, 'OP_EQUAL' ]
}

export const P2SH = { check, encode, decode, script }
