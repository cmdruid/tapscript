import { z } from 'zod'

const hexstr  = z.string().regex(/^[a-fA-F0-9]$/)
const hash    = z.string().regex(/^[a-fA-F0-9]{64}$/)
const uint32  = z.number().min(0).max(0xFFFFFFFF)
const uint64  = z.bigint()
const byteArr = z.instanceof(Uint8Array)
const asmcode = z.union([ hexstr, uint32, z.string(), byteArr ]).array()
const script  = z.union([ asmcode, hexstr, byteArr ])
const witness = z.array(script)

const TxOutput = z.object({
  value        : z.union([ uint32, uint64 ]),
  scriptPubKey : script
})

const TxInput = z.object({
  txid      : hash,
  vout      : uint32,
  scriptSig : script,
  sequence  : uint32,
  prevout   : TxOutput.optional(),
  witness
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
