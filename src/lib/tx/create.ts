import { TxData, TxTemplate } from '../../schema/types.js'

const DEFAULT_TX = {
  version  : 2,
  vin      : [],
  vout     : [],
  locktime : 0
}

const DEFAULT_VIN = {
  scriptSig : [],
  sequence  : 4294967293,
  witness   : []
}

const DEFAULT_VOUT = {
  value        : 0n,
  scriptPubKey : []
}

export function createTx (template : TxTemplate) : TxData {
  const tx = { ...DEFAULT_TX, ...template }
  tx.vin  = tx.vin.map(txin   => { return { ...DEFAULT_VIN, ...txin }   })
  tx.vout = tx.vout.map(txout => { return { ...DEFAULT_VOUT, ...txout } })
  return tx as TxData
}
