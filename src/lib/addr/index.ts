// https://en.bitcoin.it/wiki/Invoice_address

import { P2PKH }  from './p2pkh.js'
import { P2SH }   from './p2sh.js'
import { P2W }    from './p2w.js'
import { P2TR }   from './p2tr.js'

import { decodeAddress, convertAddress } from './utils.js'

export const Address = {
  p2pkh    : P2PKH,
  p2sh     : P2SH,
  p2w      : P2W,
  p2tr     : P2TR,
  decode   : decodeAddress,
  toScript : convertAddress
}
