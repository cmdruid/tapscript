import { Buff }       from '@cmdcode/buff'
import { ScriptData } from './script.js'

export type LockType        = 'block' | 'stamp' | null
export type SequenceField   = string | number
export type ValueField      = bigint | number
export type TxBytes         = string | Uint8Array
export type TransactionData = TxData & SizeData & TxInfo

export interface TxData {
  version  : number
  vin      : TxInput[]
  vout     : TxOutput[]
  locktime : number
}

export interface TxInfo {
  txid : string
  hash : string
  hex  : string
}

export interface TxInput {
  txid      : string
  vout      : number
  prevout  ?: TxOutput
  sequence  : number
  scriptSig : ScriptData
  witness   : ScriptData[]
}

export interface TxPrevout extends TxInput {
  prevout : TxOutput
}

export interface TxOutput {
  value        : bigint
  scriptPubKey : ScriptData
}

export interface TimelockData {
  enabled : boolean
  blocks  : number  | null
  type    : LockType
  stamp   : number  | null
  value   : number
}

export interface SizeData {
  size   : number
  bsize  : number
  vsize  : number
  weight : number
}

export interface WitnessData {
  annex  : Buff | null
  cblock : Buff | null
  script : Buff | null
  params : Buff[]
}

export interface TxInTemplate {
  txid : string
  vout : number
  scriptSig ?: ScriptData
  sequence  ?: number | string
  witness   ?: ScriptData[]
  prevout   ?: TxOutTemplate
}

export interface TxOutTemplate {
  value ?: string | number | bigint
  scriptPubKey ?: ScriptData
}

export interface TxTemplate {
  version  ?: number
  vin      ?: TxInTemplate[]
  vout     ?: TxOutTemplate[]
  locktime ?: number | string
}
