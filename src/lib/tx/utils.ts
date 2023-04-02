import { TxFmt }  from './format.js'
import { TxData } from '../../schema/types.js'

export function getTxid (txdata : TxData | string | Uint8Array) : string {
  const data = TxFmt.toBytes(txdata)
  return data.toHash('hash256').reverse().hex
}
