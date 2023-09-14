import { Buff, Bytes, Stream } from '@cmdcode/buff'

import { CtrlBlock } from '../../types/index.js'
import { convert_33b } from '@cmdcode/crypto-tools/keys'

export function parse_cblock (cblock : Bytes) : CtrlBlock {
  const buffer  = new Stream(Buff.bytes(cblock))
  const cbyte   = buffer.read(1).num
  const int_pub = buffer.read(32).hex
  const [ version, parity ] = parse_cbits(cbyte)
  const path = []
  while (buffer.size >= 32) {
    path.push(buffer.read(32).hex)
  }
  if (buffer.size !== 0) {
    throw new Error('Non-empty buffer on control block: ' + String(buffer))
  }
  return { int_pub, path, parity, version }
}

export function parse_cbits (cbits : number) {
  return (cbits % 2 === 0)
    ? [ cbits - 0, 0x02 ]
    : [ cbits - 1, 0x03 ]
}

export function parse_parity (pubkey : Bytes) : number {
  const [ parity ] = convert_33b(pubkey)
  if (parity === 0x02) return 0
  if (parity === 0x03) return 1
  throw new Error('Invalid parity bit: ' + String(parity))
}

export default {
  cbits  : parse_cbits,
  cblock : parse_cblock,
  parity : parse_parity
}
