import { z } from 'zod'

import { hash, script, uint32, uint64, witness } from './base.js'

const txout = z.object({
  value        : uint64,
  scriptPubKey : script
})

const txin = z.object({
  txid      : hash,
  vout      : uint32,
  scriptSig : script,
  sequence  : uint32,
  prevout   : txout.optional(),
  witness
})

const txdata = z.object({
  version  : uint32,
  vin      : txin.array(),
  vout     : txout.array(),
  locktime : uint32
})

export {
  txin,
  txout,
  txdata
}
