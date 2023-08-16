import { z } from 'zod'

const hexstr  = z.string().regex(/^[a-fA-F0-9]$/)
const hash    = z.string().regex(/^[a-fA-F0-9]{64}$/)
const uint32  = z.number().min(0).max(0xFFFFFFFF)
const uint64  = z.bigint().min(0n).max(0xFFFFFFFFFFFFFFFFn)
const uint8a  = z.instanceof(Uint8Array)

const asmcode = z.union([ hexstr, uint32, z.string(), uint8a ]).array()
const script  = z.union([ asmcode, hexstr, uint8a ])
const witness = z.array(script)

export default {
  witness,
  script,
  hexstr,
  hash,
  uint32,
  uint64
}
