import { Buff }       from '@cmdcode/buff-utils'
import { Noble }      from '@cmdcode/crypto-utils'
import { hashTx }     from './hash.js'
import { TxTemplate } from '../../../schema/types.js'
import { HashConfig } from '../types.js'

export async function signTx (
  seckey  : string | Uint8Array,
  txdata  : TxTemplate | string | Uint8Array,
  index   : number,
  config  : HashConfig = {}
) : Promise<Buff> {
  const { sigflag = 0x01 } = config
  const hash = hashTx(txdata, index, config)
  const sig  = await Noble.sign(hash, seckey)

  return Buff.join([ sig, sigflag ])
}
