import { Buff }       from '@cmdcode/buff'
import { ScriptData } from './script.js'

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

export interface TxFullInput extends TxInput {
  prevout : TxOutput
}

export interface TxOutput {
  value        : bigint
  scriptPubKey : ScriptData
}

export interface TimelockData {
  enabled   : boolean
  height    : number  | null
  lock_type : 'block' | 'stamp'
  stamp     : number  | null
  value     : number
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

export interface VinTemplate {
  txid : string
  vout : number
  scriptSig ?: ScriptData
  sequence  ?: number | string
  witness   ?: ScriptData[]
  prevout   ?: VoutTemplate
}

export interface VoutTemplate {
  value ?: string | number | bigint
  scriptPubKey ?: ScriptData
}

export interface TxTemplate {
  version  ?: number
  vin      ?: VinTemplate[]
  vout     ?: VoutTemplate[]
  locktime ?: number | string
}
