import { Buff }   from '@cmdcode/buff-utils'
import { isHex }  from '../check.js'
import { Script } from '../script/index.js'

import { Bytes, ScriptData, WitnessData } from '../../schema/types.js'

const LEAF_VERSIONS = [
  0xc0, 0xc2, 0xc4, 0xc6, 0xc8, 0xca, 0xcc, 0xce,
  0xd0, 0xd2, 0xd4, 0xd6, 0xd8, 0xda, 0xdc, 0xde,
  0xe0, 0xe2, 0xe4, 0xe6, 0xe8, 0xea, 0xec, 0xee,
  0xf0, 0xf2, 0xf4, 0xf6, 0xf8, 0xfa, 0xfc, 0xfe,
  0x66, 0x7e, 0x80, 0x84, 0x96, 0x98, 0xba, 0xbc,
  0xbe
]

function parseAnnex (
  data : ScriptData[]
) : Uint8Array | null {
  let item = data.at(-1)

  if (isHex(item)) {
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

function parseBlock (
  data : ScriptData[]
) : Uint8Array | null {
  let item = data.at(-1)

  if (isHex(item)) {
    item = Buff.hex(item)
  }

  if (
    data.length > 1            &&
    item instanceof Uint8Array &&
    item.length > 32           &&
    LEAF_VERSIONS.includes(item[0])
  ) {
    data.pop()
    return Buff.raw(item)
  }

  return null
}

function parseWitScript (
  data : ScriptData[]
) : Uint8Array | null {
  if (data.length > 1) {
    const item   = data.at(-1)
    try {
      const script = Script.fmt.toBytes(item)
      data.pop()
      return script
    } catch { return null }
  }
  return null
}

function parseParams (
  data : ScriptData[]
) : Bytes[] {
  const params : Bytes[] = []
  for (const d of data) {
    if (
      isHex(d) ||
      d instanceof Uint8Array
    ) {
      params.push(d)
    }
  }
  return params
}

function parseWitness (
  data : ScriptData[] = []
) : WitnessData {
  const items  = [ ...data ]
  const annex  = parseAnnex(items)
  const cblock = parseBlock(items)
  const script = parseWitScript(items)
  const params = parseParams(items)
  return { annex, cblock, script, params }
}

export const TxParse = {
  witness: parseWitness
}
