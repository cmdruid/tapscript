import { Buff, Bytes }    from '@cmdcode/buff'
import { parse_vin_meta } from './utils.js'

import * as segwit  from './segwit/index.js'
import * as taproot from './taproot/index.js'

import {
  SigHashOptions,
  TxBytes,
  TxData
} from '../../types/index.js'

export function hash_tx (
  txdata  : TxBytes | TxData,
  config ?: SigHashOptions
) : Buff {
  const { type } = parse_vin_meta(txdata, config)
  if (type === 'p2tr') {
    return taproot.hash_tx(txdata, config)
  } else if (type.startsWith('p2w')) {
    return segwit.hash_tx(txdata, config)
  } else {
    throw new Error('This signer does not support the following output type: ' + type)
  }
}

export function sign_tx (
  seckey  : Bytes,
  txdata  : TxBytes | TxData,
  config ?: SigHashOptions
) : Buff {
  const { type } = parse_vin_meta(txdata, config)
  if (type === 'p2tr') {
    return taproot.sign_tx(seckey, txdata, config)
  } else if (type.startsWith('p2w')) {
    return segwit.sign_tx(seckey, txdata, config)
  } else {
    throw new Error('This signer does not support the following output type: ' + type)
  }
}

export function verify_tx (
  txdata  : TxBytes | TxData,
  config ?: SigHashOptions
) : boolean {
  const { type } = parse_vin_meta(txdata, config)
  if (type === 'p2tr') {
    return taproot.verify_tx(txdata, config)
  } else if (type.startsWith('p2w')) {
    return segwit.verify_tx(txdata, config)
  } else {
    throw new Error('This signer does not support the following output type: ' + type)
  }
}
