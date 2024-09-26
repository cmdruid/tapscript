import { Buff }     from '@cmdcode/buff'
import { Script }   from '@/module/script/index.js'
import { encodeTx } from './encode.js'
import { TxFmt }    from './format.js'

import type {
  Bytes,
  OutputType,
  ScriptData,
  ScriptPubKeyData,
  TxData,
  WitnessData
} from '@/types/index.js'

import { hash256 } from '@cmdcode/crypto-tools/hash'

interface TxSizeData {
  size   : number
  bsize  : number
  vsize  : number
  weight : number
}

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
    if (isHex(d)            ||
    d instanceof Uint8Array || 
    typeof d === 'number'
  ) {
      params.push(Buff.bytes(d))
    } else {
      throw new Error('unrecognized value: ' + String(d))
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
