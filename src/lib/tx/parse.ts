import { Buff } from '@cmdcode/buff-utils'
import { hash } from '@cmdcode/crypto-utils'

import { LEAF_VERSIONS } from './const.js'
import { is_hex }        from '../utils.js'
import { encode_tx }     from './encode.js'
import { to_json }       from './format.js'

import * as Script from '../script/index.js'

import {
  ScriptData,
  SizeData,
  TxBytes,
  TxData,
  WitnessData
} from '../../schema/index.js'

import { assert } from '../../lib/utils.js'

function parse_annex (
  data : ScriptData[]
) : Buff | null {
  let item = data.at(-1)

  if (is_hex(item)) {
    item = Buff.hex(item)
  }

  if (
    data.length > 1            &&
    item instanceof Uint8Array &&
    item[0] === 0x50
  ) {
    data.pop()
    return Buff.raw(item)
  }

  return null
}

function parse_block (
  data : ScriptData[]
) : Buff | null {
  let item = data.at(-1)

  if (is_hex(item)) {
    item = Buff.hex(item)
  }

  if (
    data.length > 1            &&
    item instanceof Uint8Array &&
    item.length > 32           &&
    LEAF_VERSIONS.includes(item[0] & 0xfe)
  ) {
    data.pop()
    return Buff.raw(item)
  }

  return null
}

function parse_witness_data (
  data : ScriptData[]
) : Buff | null {
  if (data.length > 1) {
    try {
      const item = data.at(-1)
      assert(item !== undefined)
      data.pop()
      return Script.to_bytes(item)
    } catch (err) {
      return null
    }
  }
  return null
}

function parse_params (
  data : ScriptData[]
) : Buff[] {
  const params : Buff[] = []
  for (const d of data) {
    if (is_hex(d) || d instanceof Uint8Array) {
      params.push(Buff.bytes(d))
    }
  }
  return params
}

export function parse_witness (
  data : ScriptData[] = []
) : WitnessData {
  const items  = [ ...data ]
  const annex  = parse_annex(items)
  const cblock = parse_block(items)
  const script = parse_witness_data(items)
  const params = parse_params(items)
  return { annex, cblock, script, params }
}

export function get_txid (
  txdata : TxData | TxBytes
) : string {
  const json = to_json(txdata)
  const data = encode_tx(json, true)
  return hash.hash256(data).reverse().hex
}

export function get_txsize (
  txdata : TxData | TxBytes
) : SizeData {
  const json   = to_json(txdata)
  const bsize  = encode_tx(json, true).length
  const fsize  = encode_tx(json, false).length
  const weight = bsize * 3 + fsize
  const remain = (weight % 4 > 0) ? 1 : 0
  const vsize  = Math.floor(weight / 4) + remain
  return { size: fsize, bsize, vsize, weight }
}
