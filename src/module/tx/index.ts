import { encodeTx } from './encode.js'
import { decodeTx } from './decode.js'
import { TxFmt }    from './format.js'
import { createTx } from './create.js'

import {
  getTxid,
  getTxSize,
  readScriptPubKey,
  readWitness
} from './parse.js'

export const Tx = {
  create : createTx,
  encode : encodeTx,
  decode : decodeTx,
  fmt    : TxFmt,
  util   : {
    getTxSize,
    getTxid,
    readScriptPubKey,
    readWitness
  }
}
