import { assert } from '../utils.js'

import {
  HashConfig,
  InputData,
  TxData
} from '../../schema/index.js'

export function parse_txinput (
  txdata : TxData,
  config : HashConfig = {}
) : InputData {
  const { txindex, txinput } = config
  const ret = (typeof txindex === 'number')
    ? txdata.vin.at(txindex)
    : txinput
  assert(ret !== undefined)
  return ret
}

export function check_anypay (
  sigflag ?: number
) : boolean {
  return (
    sigflag !== undefined &&
    (sigflag & 0x80) === 0x80
  )
}

export function validate_config (
  txdata : TxData,
  config : HashConfig = {}
) : void {
  const { txindex } = config
  const { vin }     = txdata
  if (txindex !== undefined && txindex >= vin.length) {
    // If index is out of bounds, throw error.
    throw new Error('Input index out of bounds: ' + String(txindex))
  }
}
