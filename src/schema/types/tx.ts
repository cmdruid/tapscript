import { Buff }       from '@cmdcode/buff-utils'
import { ScriptData } from './script.js'

export type TxBytes      = string | Uint8Array
export type SequenceData = string | number
export type LockData     = string | number
export type ValueData    = bigint | number

export type TransactionData = TxData & SizeData & TxInfo

export interface TxData {
  version  : number
  vin      : InputData[]
  vout     : OutputData[]
  locktime : LockData
}

export interface TxInfo {
  txid : string
  hash : string
  hex  : string
}

export interface InputTemplate {
  txid     : string
  vout     : number
  prevout ?: OutputData
  sequence : SequenceData
}

export interface InputData extends InputTemplate {
  scriptSig : ScriptData
  witness   : ScriptData[]
}

export interface OutputData {
  value        : ValueData
  scriptPubKey : ScriptData
}

export interface WitnessData {
  annex  : Buff | null
  cblock : Buff | null
  script : Buff | null
  params : Buff[]
}

export interface TxTemplate {
  version  ?: number
  vin      ?: Array<{
    txid : string
    vout : number
    scriptSig ?: ScriptData
    sequence  ?: SequenceData
    witness   ?: ScriptData[]
    prevout   ?: OutputData
  }>
  vout ?: Array<{
    value        ?: ValueData
    scriptPubKey ?: ScriptData
  }>
  locktime ?: LockData
}

export interface SizeData {
  size   : number
  bsize  : number
  vsize  : number
  weight : number
}
