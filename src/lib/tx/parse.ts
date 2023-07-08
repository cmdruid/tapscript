import { Buff }     from '@cmdcode/buff-utils'
import { isHex }    from '../check.js'
import { Script }   from '../script/index.js'
import { encodeTx } from './encode.js'
import { TxFmt }    from './format.js'

import {
  Bytes,
  OutputType,
  ScriptData,
  ScriptPubKeyData,
  TxData,
  WitnessData
} from '../../schema/types.js'
import { hash256 } from '@cmdcode/crypto-utils'

interface TxSizeData {
  size   : number
  bsize  : number
  vsize  : number
  weight : number
}

const OUTPUT_TYPES : Array<[ string, RegExp ]> = [
  [ 'p2pkh',   /^76a914(?<hash>\w{40})88ac$/ ],
  [ 'p2sh',    /^a914(?<hash>\w{40})87$/     ],
  [ 'p2w-pkh', /^0014(?<hash>\w{40})$/       ],
  [ 'p2w-sh',  /^0020(?<hash>\w{64})$/       ],
  [ 'p2tr',    /^5120(?<hash>\w{64})$/       ]
]

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
) : Buff | null {
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
) : Buff | null {
  let item = data.at(-1)

  if (isHex(item)) {
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

function parseWitScript (
  data : ScriptData[]
) : Buff | null {
  if (data.length > 1) {
    const item = data.at(-1)
    try {
      const script = Script.fmt.toBytes(item)
      data.pop()
      return script
    } catch (err) {
      return null
    }
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

export function readWitness (
  data : ScriptData[] = []
) : WitnessData {
  const items  = [ ...data ]
  const annex  = parseAnnex(items)
  const cblock = parseBlock(items)
  const script = parseWitScript(items)
  const params = parseParams(items)
  return { annex, cblock, script, params }
}

export function readScriptPubKey (
  script : ScriptData
) : ScriptPubKeyData {
  const hex = Script.fmt.toBytes(script, false).hex
  for (const [ keytype, pattern ] of OUTPUT_TYPES) {
    const type = keytype as OutputType
    const { groups } = pattern.exec(hex) ?? {}
    const { hash   } = groups ?? {}
    if (isHex(hash)) {
      return { type, data: Buff.hex(hash) }
    }
  }
  return { type: 'raw', data: Buff.hex(hex) }
}

export function getTxid (txdata : TxData | Bytes) : string {
  const json = TxFmt.toJson(txdata)
  const data = encodeTx(json, true)
  return hash256(data).reverse().hex
}

export function getTxSize (txdata : TxData | Bytes) : TxSizeData {
  const json   = TxFmt.toJson(txdata)
  const bsize  = encodeTx(json, true).length
  const fsize  = encodeTx(json, false).length
  const weight = bsize * 3 + fsize
  const remain = (weight % 4 > 0) ? 1 : 0
  const vsize  = Math.floor(weight / 4) + remain
  return { size: fsize, bsize, vsize, weight }
}
