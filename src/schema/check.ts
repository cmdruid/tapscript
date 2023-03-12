import { z } from 'zod'

import { OPCODE_MAP } from '../lib/script/words.js'

const OpEnum = (Object.keys(OPCODE_MAP) as unknown) as readonly [string, ...string[]]

const hexstr = z.string().regex(/^[a-fA-F0-9]$/)
const hash   = z.string().regex(/^[a-fA-F0-9]{64}$/)
const uint32 = z.number().min(0).max(0xFFFFFFFF)
const uint64 = z.bigint()

const strOrNumArray = z.array(z.union([ z.string(), z.number() ]))

const opName  = z.enum(OpEnum)
const opCode  = z.nativeEnum(OPCODE_MAP)
const script  = z.union([ hexstr, opName, opCode ]).array()
const witness = z.array(z.union([ hexstr, script ]))

const TxInput = z.object({
  prevTxid  : hash,
  prevOut   : uint32,
  scriptSig : script,
  sequence  : uint32,
  witness
})

const TxOutput = z.object({
  value        : uint64,
  scriptPubKey : strOrNumArray
})

const TxData = z.object({
  version  : uint32,
  vin      : z.array(TxInput),
  vout     : z.array(TxOutput),
  locktime : uint32
})

export const Schema = {
  TxData,
  TxInput,
  TxOutput,
  witness,
  script,
  hexstr,
  hash,
  uint32,
  uint64
}
