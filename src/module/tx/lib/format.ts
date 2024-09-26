import { Buff, Bytes } from '@cmdcode/buff'
import { check }       from '@/util/index.js'
import { decodeTx }    from './decode.js'
import { encodeTx }    from './encode.js'
import { createTx }    from './create.js'

import type { TxData, TxTemplate } from '@/types/index.js'

export function toJson (
  txdata ?: Bytes | TxData | TxTemplate
) : TxData {
  if (check.is_bytes(txdata)) {
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
  if (check.is_bytes(txdata)) {
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
