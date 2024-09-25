import { Buff }       from '@cmdcode/buff'
import { noble }      from '@cmdcode/crypto-tools'
import { hashTx }     from './hash.js'
import { TxTemplate } from '../../../schema/types.js'
import { HashConfig } from '../types.js'

export function signTx (
  seckey  : string | Uint8Array,
  txdata  : TxTemplate | string | Uint8Array,
  index   : number,
  config  : HashConfig = {}
) : Buff {
  const { sigflag = 0x01 } = config
  const hash = hashTx(txdata, index, config)
  const sig  = noble.secp.sign(hash, seckey).toDERRawBytes(true)
  return Buff.join([ sig, sigflag ])
}
