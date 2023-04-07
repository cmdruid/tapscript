// https://en.bitcoin.it/wiki/Invoice_address

import { P2PKH }  from './p2pkh.js'
import { P2SH }   from './p2sh.js'
import { P2WPKH } from './p2w-pkh.js'
import { P2WSH }  from './p2w-sh.js'
import { P2TR }   from './p2tr.js'

import {
  decodeAddress,
  fromScriptPubKey,
  toScriptPubKey
} from './utils.js'

export const Address = {
  p2pkh  : P2PKH,
  p2sh   : P2SH,
  p2wpkh : P2WPKH,
  p2wsh  : P2WSH,
  p2tr   : P2TR,
  decode : decodeAddress,
  fromScriptPubKey,
  toScriptPubKey
}
