import { Buff, Bytes } from '@cmdcode/buff-utils'
import { signer }      from '@cmdcode/crypto-utils'
import { hash_tx }     from './hash.js'

import {
  HashOptions,
  TxBytes,
  TxData
} from '../../../types/index.js'

export function sign_tx (
  seckey : Bytes,
  txdata : TxBytes | TxData,
  config : HashOptions = {}
) : Buff {
  // Set the signature flag type.
  const { sigflag = 0x00 } = config
  // Calculate the transaction hash.
  const hash = hash_tx(txdata, config)
  // Sign the transaction hash with secret key.
  const sig  = signer.sign(hash, seckey)
  // Return the signature.
  return (sigflag === 0x00)
    ? Buff.raw(sig)
    : Buff.join([ sig, sigflag ])
}
