import { Buff }     from '@cmdcode/buff-utils'
import { isBytes }  from '../check.js'
import { decodeTx } from './decode.js'
import { encodeTx } from './encode.js'
import { TxData }   from '../../schema/types.js'

function toJson (
  txdata ?: TxData | string | Uint8Array
) : TxData {
  if (isBytes(txdata)) {
    return decodeTx(txdata)
  }
  if (
    typeof txdata === 'object' &&
    !(txdata instanceof Uint8Array)
  ) {
    encodeTx(txdata)
    return txdata
  }
  throw new Error('Invalid format: ' + String(typeof txdata))
}

function toBytes (
  txdata ?: TxData | string | Uint8Array
) : Buff {
  if (isBytes(txdata)) {
    decodeTx(txdata)
    return Buff.bytes(txdata)
  }
  if (typeof txdata === 'object') {
    return encodeTx(txdata)
  }
  throw new Error('Invalid format: ' + String(typeof txdata))
}

export const TxFmt = {
  toBytes,
  toJson
}
