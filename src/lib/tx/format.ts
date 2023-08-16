import { Buff }      from '@cmdcode/buff-utils'
import { is_bytes }  from '../utils.js'
import { decode_tx } from './decode.js'
import { encode_tx } from './encode.js'
import { create_tx } from './create.js'

import {
  TxBytes,
  TxData,
  TxTemplate
} from '../../schema/index.js'

export function to_json (
  txdata : TxBytes | TxData | TxTemplate
) : TxData {
  if (is_bytes(txdata)) {
    return decode_tx(txdata)
  }
  if (
    typeof txdata === 'object' &&
    !(txdata instanceof Uint8Array)
  ) {
    encode_tx(txdata)
    return create_tx(txdata)
  }
  throw new Error('Invalid format: ' + String(typeof txdata))
}

export function to_bytes (
  txdata ?: TxBytes | TxData | TxTemplate
) : Buff {
  if (is_bytes(txdata)) {
    decode_tx(txdata)
    return Buff.bytes(txdata)
  }
  if (typeof txdata === 'object') {
    return encode_tx(txdata)
  }
  throw new Error('Invalid format: ' + String(typeof txdata))
}
