import { Buff, Bytes, Stream } from '@cmdcode/buff-utils'

import { CtrlBlock } from '../../schema/index.js'

export function parse_cblock (cblock : Bytes) : CtrlBlock {
  const buffer = new Stream(Buff.bytes(cblock))
  const cbyte  = buffer.read(1).num
  const intkey = buffer.read(32)
  const [ version, parity ] = (cbyte % 2 === 0)
    ? [ cbyte, 0x02 ]
    : [ cbyte - 1, 0x03 ]
  const paths  = []
  while (buffer.size >= 32) {
    paths.push(buffer.read(32).hex)
  }
  if (buffer.size !== 0) {
    throw new Error('Non-empty buffer on control block: ' + String(buffer))
  }
  return { intkey, paths, parity, version }
}

export function read_parity (parity : number | string = 0x02) : number {
  if (parity === 0 || parity === 1) return parity
  if (parity === 0x02 || parity === '02') return 0
  if (parity === 0x03 || parity === '03') return 1
  throw new Error('Invalid parity bit: ' + String(parity))
}
