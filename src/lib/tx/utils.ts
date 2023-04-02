import { Buff }     from '@cmdcode/buff-utils'
import { encodeTx } from './encode.js'
import { TxData }   from '../../schema/types.js'

export function getTxid (txdata : TxData | string | Uint8Array) : string {
  let data : Buff
  if (txdata instanceof Uint8Array) {
    data = Buff.raw(txdata)
  } else if (typeof txdata === 'string') {
    data = Buff.hex(txdata)
  } else if (typeof txdata === 'object') {
    data = encodeTx(txdata)
  } else {
    throw new Error('Unrecognized format:' + String(txdata))
  }
  return data.toHash('hash256').reverse().hex
}
