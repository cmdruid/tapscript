import { encodeTx }     from './encode.js'
import { decodeTx }     from './decode.js'
import { TxFmt }        from './format.js'
import { getTxid }      from './utils.js'
import { readWitness }  from './parse.js'

export const TxCalc = {
  txid: getTxid
}

export const Tx = {
  encode : encodeTx,
  decode : decodeTx,
  fmt    : TxFmt,
  utils  : { getTxid, readWitness }
}
