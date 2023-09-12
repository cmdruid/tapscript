import { Buff }      from '@cmdcode/buff'
import { is_bytes }  from '../util.js'
import { decode_tx } from './decode.js'

import * as schema from '../../schema/index.js'

import {
  TxInput,
  VinTemplate,
  TxBytes,
  TxData,
  TxTemplate,
  VoutTemplate,
  TxOutput
} from '../../types/index.js'

const DEFAULT_TX = {
  version  : 2,
  vin      : [],
  vout     : [],
  locktime : 0
}

const DEFAULT_VIN = {
  scriptSig : [],
  sequence  : 4294967293,
  witness   : []
}

const DEFAULT_VOUT = {
  value        : 0n,
  scriptPubKey : []
}

export function parse_vin (
  vin : VinTemplate | TxInput
) : TxInput {
  const sequence = (typeof vin.sequence === 'string')
    ? Buff.hex(vin.sequence).num
    : vin.sequence ?? DEFAULT_VIN.sequence
  const prevout = (typeof vin.prevout !== 'undefined')
    ? parse_vout(vin.prevout)
    : vin.prevout
  return { ...DEFAULT_VIN, ...vin, prevout, sequence }
}

export function parse_vout (
  vout : VoutTemplate | TxOutput
) : TxOutput {
  let value : bigint
  if (typeof vout.value === 'number') {
    value = BigInt(vout.value)
  } else if (typeof vout.value === 'string') {
    value = Buff.hex(vout.value).big
  } else if (typeof vout.value === 'bigint') {
    value = vout.value
  } else {
    value = 0n
  }
  return { ...DEFAULT_VOUT, ...vout, value }
}

export function parse_tx (
  txdata : TxBytes | TxData | TxTemplate
) : TxData {
  if (is_bytes(txdata)) {
    return decode_tx(txdata)
  }
  const locktime = (typeof txdata.locktime === 'string')
    ? Buff.hex(txdata.locktime).num
    : txdata.locktime ?? DEFAULT_TX.locktime
  const tx = { ...DEFAULT_TX, ...txdata, locktime }
  tx.vin  = tx.vin.map(txin   => parse_vin(txin))
  tx.vout = tx.vout.map(txout => parse_vout(txout))
  return schema.tx.txdata.parse(tx)
}
