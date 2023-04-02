// https://en.bitcoin.it/wiki/Invoice_address

import { P2PKH }  from './p2pkh.js'
import { P2SH }   from './p2sh.js'
import { P2W }    from './p2w.js'
import { P2TR }   from './p2tr.js'

import { getAddressType, decodeAddress, convertAddress } from './utils.js'

export const Address = {
  P2PKH,
  P2SH,
  P2W,
  P2TR,
  decode   : decodeAddress,
  getType  : getAddressType,
  toScript : convertAddress
}
