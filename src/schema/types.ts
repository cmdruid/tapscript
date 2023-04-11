import { Buff } from '@cmdcode/buff-utils'

export type Networks   = 'main' | 'testnet' | 'signet' | 'regtest'

export type InputType  = 'p2pkh'   | 'p2sh'   | 'p2w-p2pkh' | 'p2w-p2sh' |
                         'p2w-pkh' | 'p2w-sh' | 'p2tr-pk'   | 'p2tr-ts'

export type OutputType = 'p2pkh'  | 'p2sh'  | 'p2w-pkh' | 'p2w-sh' | 'p2tr' | 'raw'

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

export interface TxData {
  version  : number
  vin      : InputData[]
  vout     : OutputData[]
  locktime : LockData
}

export interface InputData {
  txid : string
  vout : number
  scriptSig : ScriptData
  sequence  : SequenceData
  witness   : ScriptData[]
  prevout  ?: OutputData
}

export interface OutputData {
  value        : ValueData
  scriptPubKey : ScriptData
}

export interface ScriptPubKeyData {
  type : OutputType
  data : Buff
}

export interface WitnessData {
  annex  : Buff | null
  cblock : Buff | null
  script : Buff | null
  params : Bytes[]
}

export type SequenceData = string | number
export type LockData     = string | number
export type ValueData    = number | bigint
export type ScriptData   = Bytes  | Word[]
export type Bytes        = string | Uint8Array
export type Word         = string | number | Uint8Array
