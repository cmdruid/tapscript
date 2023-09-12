import { Buff, Bytes } from '@cmdcode/buff'
import { noble }       from '@cmdcode/crypto-tools'
import { hash_tx }     from './hash.js'

import {
  SigHashOptions,
  TxBytes,
  TxData
} from '../../../types/index.js'

export function sign_tx (
  seckey  : Bytes,
  txdata  : TxBytes | TxData,
  options : SigHashOptions = {}
) : Buff {
  const { sigflag = 0x01 } = options
  const sec  = Buff.bytes(seckey)
  const hash = hash_tx(txdata, options)
  const sig  = noble.secp.sign(hash, sec).toDERRawBytes(true)
  return Buff.join([ sig, sigflag ])
}
