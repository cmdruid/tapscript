import { Buff }     from '@cmdcode/buff-utils'
import { isBytes }  from '../check.js'
import { decodeTx } from './decode.js'
import { encodeTx } from './encode.js'
import { createTx } from './utils.js'

import { Bytes, TxData, TxTemplate } from '../../schema/types.js'

export function toJson (
  txdata ?: Bytes | TxData | TxTemplate
) : TxData {
  if (isBytes(txdata)) {
    return decodeTx(txdata)
  }
  if (
    typeof txdata === 'object' &&
    !(txdata instanceof Uint8Array)
  ) {
    encodeTx(txdata)
    return createTx(txdata)
  }
  throw new Error('Invalid format: ' + String(typeof txdata))
}

export function toBytes (
  txdata ?: Bytes | TxData | TxTemplate
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
