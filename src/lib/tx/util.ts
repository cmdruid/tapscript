import { hash }      from '@cmdcode/crypto-tools'
import { encode_tx } from './encode.js'
import { parse_tx }  from './parse.js'

import {
  SizeData,
  TxBytes,
  TxData,
  TxOutput
} from '../../types/index.js'

import { create_addr } from '../addr/parse.js'

export function parse_txid (
  txdata : TxData | TxBytes
) : string {
  const json = parse_tx(txdata)
  const data = encode_tx(json, true)
  return hash.hash256(data).reverse().hex
}

export function parse_txsize (
  txdata : TxData | TxBytes
) : SizeData {
  const json   = parse_tx(txdata)
  const bsize  = encode_tx(json, true).length
  const fsize  = encode_tx(json, false).length
  const weight = bsize * 3 + fsize
  const remain = (weight % 4 > 0) ? 1 : 0
  const vsize  = Math.floor(weight / 4) + remain
  return { size: fsize, bsize, vsize, weight }
}

export function search_vin (
  vout   : TxOutput,
  txdata : TxData
) {
  const { value, scriptPubKey } = vout
  const address = create_addr(scriptPubKey)
  const txindex = txdata.vin.findIndex(e => {
    if (e.prevout === undefined) return false
    const prev_val  = e.prevout.value
    const prev_addr = create_addr(e.prevout.scriptPubKey)
    return (value === prev_val && address === prev_addr)
  })
  return { txindex, txinput: txdata.vin[txindex] }
}
