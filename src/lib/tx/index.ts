import { encodeTx } from './encode.js'
import { decodeTx } from './decode.js'
import { TxFmt }    from './format.js'
import { createTx } from './utils.js'

import {
  getTxid,
  readScriptPubKey,
  readWitness
}  from './parse.js'

export const TxCalc = {
  txid: getTxid
}

export const Tx = {
  create : createTx,
  encode : encodeTx,
  decode : decodeTx,
  fmt    : TxFmt,
  util   : {
    getTxid,
    readScriptPubKey,
    readWitness
  }
}
