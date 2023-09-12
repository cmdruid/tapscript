import { Buff, Bytes } from '@cmdcode/buff'
import { signer }      from '@cmdcode/crypto-tools'
import { hash_tx }     from './hash.js'

import {
  SigHashOptions,
  TxBytes,
  TxData
} from '../../../types/index.js'

//  TODO:  Create generic hash / sign / verify.
// Use prevout to detect which standard to use.

export function sign_tx (
  seckey : Bytes,
  txdata : TxBytes | TxData,
  config : SigHashOptions = {}
) : Buff {
  // Set the signature flag type.
  const { sigflag = 0x00 } = config
  // Calculate the transaction hash.
  const hash = hash_tx(txdata, config)
  // Sign the transaction hash with secret key.
  const sig  = signer.sign_msg(hash, seckey)
  // Return the signature.
  return (sigflag === 0x00)
    ? Buff.raw(sig)
    : Buff.join([ sig, sigflag ])
}
