export interface Data {
  version  : number
  vin      : InData[]
  vout     : OutData[]
  locktime : LockData
}

export interface InData {
  prevTxid  : string
  prevOut   : number
  scriptSig : ScriptData
  sequence  : SeqData
  witness?  : string[]
}

export interface OutData {
  value : number
  scriptPubKey : string
}

export type ScriptData  = string | WordArray
export type SeqData     = string | number
export type LockData    = number
export type WitnessData = string[]
export type WordArray   = Array<string | number>