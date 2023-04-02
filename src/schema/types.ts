export type Networks   = 'main' | 'testnet' | 'signet' | 'regtest'

export type InputType  = 'p2pkh'  | 'p2sh'  | 'p2w-p2pkh' | 'p2w-p2sh' |
                         'p2wpkh' | 'p2wsh' | 'p2tr-pk'   | 'p2tr-ts'

export type OutputType = 'p2pkh'  | 'p2sh'  | 'p2wpkh' | 'p2wsh' | 'p2tr'

export interface TxData {
  version  : number
  vin      : InputData[]
  vout     : OutputData[]
  locktime : LockData
}

export interface InputData {
  txid : string
  vout : number
  scriptSig ?: ScriptData
  sequence  ?: SequenceData
  witness   ?: ScriptData[]
  prevout   ?: OutputData
}

export interface OutputData {
  value        : number | bigint
  scriptPubKey : ScriptData
}

export interface WitnessData {
  annex  : Uint8Array | null
  cblock : Uint8Array | null
  script : Uint8Array | null
  params : Bytes[]
}

export type SequenceData = string | number
export type ScriptData   = Bytes  | WordArray
export type LockData     = number
export type Bytes        = string | Uint8Array
export type Word         = string | number | Uint8Array
export type WordArray    = Word[]
