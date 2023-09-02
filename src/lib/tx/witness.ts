import { Buff } from '@cmdcode/buff-utils'

import { LEAF_VERSIONS } from './const.js'
import { is_hex }        from '../util.js'

import * as assert from '../assert.js'
import * as Script from '../script/index.js'

import {
  ScriptData,
  WitnessData
} from '../../types/index.js'

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

function parse_cblock (
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

function parse_script (
  data : ScriptData[]
) : Buff | null {
  if (data.length > 1) {
    try {
      const item = data.at(-1)
      assert.ok(item !== undefined)
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
  const cblock = parse_cblock(items)
  const script = parse_script(items)
  const params = parse_params(items)
  return { annex, cblock, params, script }
}
