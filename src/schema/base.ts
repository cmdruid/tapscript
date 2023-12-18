import { z } from 'zod'

import { OPCODE_MAP } from '../lib/script/const.js'

const keys = Object.keys(OPCODE_MAP) as [string]

const hexstr  = z.string().regex(/^[a-fA-F0-9]*$/).refine(e => e.length % 2 === 0)
const hash    = z.string().regex(/^[a-fA-F0-9]{64}$/)
const uint32  = z.number().min(0).max(0xFFFFFFFF)
const uint64  = z.bigint().min(0n).max(0xFFFFFFFFFFFFFFFFn)
const uint8a  = z.instanceof(Uint8Array)
const opcodes = z.enum(keys)

const asmcode = z.union([ uint32, opcodes, hexstr, uint8a ]).array()
const script  = z.union([ asmcode, hexstr, uint8a ])
const witness = z.array(script)

export {
  witness,
  script,
  hexstr,
  hash,
  uint32,
  uint64
}
