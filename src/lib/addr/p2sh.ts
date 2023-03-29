import { Buff } from '@cmdcode/buff-utils'
import { Networks, ScriptData } from '../../schema/types.js'
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
  const bytes  = Buff.bytes(Script.encode(script))
  return bytes.toHash('hash160').prepend(prefix).tob58check()
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
