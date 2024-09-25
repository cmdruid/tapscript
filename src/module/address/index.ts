import { P2PKH }  from './lib/p2pkh.js'
import { P2SH }   from './lib/p2sh.js'
import { P2WPKH } from './lib/p2w-pkh.js'
import { P2WSH }  from './lib/p2w-sh.js'
import { P2TR }   from './lib/p2tr.js'

import {
  decodeAddress,
  fromScriptPubKey,
  toScriptPubKey
} from './lib/tool.js'

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
