// https://en.bitcoin.it/wiki/Invoice_address

import P2PKH  from './p2pkh.js'
import P2SH   from './p2sh.js'
import P2WPKH from './p2wpkh.js'
import P2WSH  from './p2wsh.js'
import P2TR   from './p2tr.js'

export { Bech32, Bech32m } from './encoder.js'

export {
  create_addr,
  parse_addr
} from './parse.js'

export {
  P2PKH,
  P2SH,
  P2WPKH,
  P2WSH,
  P2TR
}
