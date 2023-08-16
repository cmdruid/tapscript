import { Buff, Bytes } from '@cmdcode/buff-utils'
import { noble }       from '@cmdcode/crypto-utils'
import { hash_tx }     from './hash.js'

import {
  HashConfig,
  TxBytes,
  TxData
} from '../../../schema/index.js'

export function sign_tx (
  seckey  : Bytes,
  txdata  : TxBytes | TxData,
  config  : HashConfig = {}
) : Buff {
  const { sigflag = 0x01 } = config
  const sec  = Buff.bytes(seckey)
  const hash = hash_tx(txdata, config)
  const sig  = noble.secp.sign(hash, sec).toDERRawBytes(true)
  return Buff.join([ sig, sigflag ])
}
