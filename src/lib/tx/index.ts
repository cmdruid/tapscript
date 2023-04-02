import { encodeTx }  from './encode.js'
import { decodeTx }  from './decode.js'
import { TxFmt }     from './format.js'
import { getTxid }   from './utils.js'
import { TxParse }   from './parse.js'

export const TxCalc = {
  txid: getTxid
}

export const Tx = {
  calc   : TxCalc,
  encode : encodeTx,
  decode : decodeTx,
  fmt    : TxFmt,
  parse  : TxParse
}
