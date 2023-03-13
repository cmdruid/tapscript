export interface TxData {
  version  : number
  input    : InputData[]
  output   : OutputData[]
  locktime : LockData
}

export interface InputData {
  txid : string
  vout : number
  scriptSig ?: ScriptData
  sequence  ?: SequenceData
  witness   ?: WitnessData
  prevout   ?: OutputData
}

export interface OutputData {
  address     ?: string
  value        : number | bigint
  scriptPubKey : ScriptData
}

export type SequenceData = string | number
export type ScriptData   = Bytes  | WordArray
export type WitnessData  = ScriptData[]
export type LockData     = number
export type Bytes        = string | Uint8Array
export type Word         = string | number | Uint8Array
export type WordArray    = Word[]
