import { keys } from '@cmdcode/crypto-tools'

import * as assert from '../assert.js'

import { parse_tx }     from '../tx/parse.js'
import { parse_script } from '../script/parse.js'

import {
  SigHashOptions,
  TxInput,
  TxBytes,
  TxData,
  ScriptMeta
} from '../../types/index.js'

export const get_pubkey = keys.get_pubkey
export const get_seckey = keys.get_seckey

export function parse_txinput (
  txdata  : TxData,
  config ?: SigHashOptions
) : TxInput {
  let { txindex, txinput } = config ?? {}
  if (txindex !== undefined) {
    if (txindex >= txdata.vin.length) {
      // If index is out of bounds, throw error.
      throw new Error('Input index out of bounds: ' + String(txindex))
    }
    txinput = txdata.vin.at(txindex)
  }
  assert.ok(txinput !== undefined)
  return txinput
}

export function parse_vin_meta (
  txdata   : TxBytes | TxData,
  options ?: SigHashOptions
) : ScriptMeta {
  txdata = parse_tx(txdata)
  const { prevout } = parse_txinput(txdata, options)
  assert.ok(prevout !== undefined)
  return parse_script(prevout.scriptPubKey)
}
