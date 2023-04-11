import { Buff }       from '@cmdcode/buff-utils'
import { sign }       from '@cmdcode/crypto-utils'
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
  const sig  = sign(seckey, hash, 'ecdsa')
  return Buff.join([ sig, sigflag ])
}
