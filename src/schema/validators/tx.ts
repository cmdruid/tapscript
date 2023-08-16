import { z } from 'zod'

import base from './base.js'

const txout = z.object({
  value        : base.uint64,
  scriptPubKey : base.script
})

const txin = z.object({
  txid      : base.hash,
  vout      : base.uint32,
  scriptSig : base.script,
  sequence  : base.uint32,
  prevout   : txout,
  witness   : base.witness
})

const txdata = z.object({
  version  : base.uint32,
  vin      : txin.array(),
  vout     : txout.array(),
  locktime : base.uint32
})

export default {
  in   : txin,
  out  : txout,
  data : txdata
}
