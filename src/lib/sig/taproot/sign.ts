import { Buff, Bytes } from '@cmdcode/buff-utils'
import { hash_tx }     from './hash.js'

import {
  SignOptions,
  signer
} from '@cmdcode/crypto-utils'

import {
  TxBytes,
  TxData,
  HashConfig
} from '../../../schema/index.js'

export function sign_tx (
  seckey   : Bytes,
  txdata   : TxBytes | TxData,
  config   : HashConfig = {},
  options ?: SignOptions
) : Buff {
  // Set the signature flag type.
  const { sigflag = 0x00 } = config
  // Calculate the transaction hash.
  const hash = hash_tx(txdata, config)
  // Sign the transaction hash with secret key.
  const sig  = signer.sign(hash, seckey, options)
  // Return the signature.
  return (sigflag === 0x00)
    ? Buff.raw(sig)
    : Buff.join([ sig, sigflag ])
}
