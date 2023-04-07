import { Buff }            from '@cmdcode/buff-utils'
import { Bytes, Networks, ScriptData } from '../../schema/types.js'
import { Script } from '../script/index.js'
import { checkSize } from '../utils.js'
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
  input   : Bytes,
  network : Networks = 'main'
) : string {
  const prefix = BECH32_PREFIXES[network]
  const bytes = Buff.bytes(input)
  checkSize(bytes, 32)
  return bytes.toBech32(prefix, 0)
}

export function decode (address : string) : Buff {
  if (!check(address)) {
    throw new TypeError('Invalid segwit address!')
  }
  return Buff.bech32(address)
}

export function scriptPubKey (input : Bytes) : string[] {
  const bytes = Buff.bytes(input)
  checkSize(bytes, 32)
  return [ 'OP_0', bytes.hex ]
}

export function fromScript (
  script  : ScriptData,
  network : Networks
) : string {
  const bytes = Script.fmt.toBytes(script, false)
  const hash  = bytes.toHash('sha256')
  return encode(hash, network)
}

export const P2WSH = { check, encode, decode, scriptPubKey, fromScript }
