import { Buff } from '@cmdcode/buff-utils'
import { Bytes, Networks, ScriptData } from '../../schema/types.js'
import { Script } from '../script/index.js'
import { checkSize } from '../utils.js'

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
  input   : Bytes,
  network : Networks = 'main'
) : string {
  const prefix = (network === 'main') ? Buff.num(0x05) : Buff.num(0xC4)
  const bytes  = Buff.bytes(input)
  checkSize(bytes, 20)
  return bytes.prepend(prefix).tob58chk()
}

export function decode (
  address : string,
  network : Networks = 'main'
) : Buff {
  if (!check(address, network)) {
    throw new TypeError(`Invalid p2sh address for network ${network}:` + address)
  }
  return Buff.b58chk(address).slice(1)
}

export function scriptPubKey (input : Bytes) : string[] {
  const bytes = Buff.bytes(input)
  return [ 'OP_HASH160', bytes.hex, 'OP_EQUAL' ]
}

export function fromScript (
  script   : ScriptData,
  network ?: Networks
) : string {
  const bytes = Script.fmt.toBytes(script, false)
  return encode(bytes.toHash('hash160'), network)
}

export const P2SH = { check, encode, decode, scriptPubKey, fromScript }
