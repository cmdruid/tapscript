import { Buff }     from '@cmdcode/buff-utils'
import { encodeTx } from './encode.js'
import { decodeTx } from './decode.js'
import { TxData }   from '../../schema/types.js'

export function normalizeTx (
  txdata : TxData | string | Uint8Array
) : TxData {
  if (
    typeof txdata === 'string' ||
    txdata instanceof Uint8Array
  ) {
    txdata = decodeTx(txdata)
  }
  return { ...txdata }
}

export function getTxid (txdata : TxData | string | Uint8Array) : string {
  let data : Uint8Array
  if (txdata instanceof Uint8Array) {
    data = txdata
  } else if (typeof txdata === 'string') {
    data = Buff.hex(txdata)
  } else if (typeof txdata === 'object') {
    data = Buff.hex(encodeTx(txdata))
  } else {
    throw new Error('Unrecognized format:' + String(txdata))
  }
  return Buff.raw(data).toHash('hash256').reverse().hex
}
