import { P2PKH }    from './p2pkh.js'
import { P2SH }     from './p2sh.js'
import { P2W }      from './p2w.js'
import { P2TR }     from './p2tr.js'
import { getType, convert } from './utils.js'

export const Address = {
  P2PKH,
  P2SH,
  P2W,
  P2TR,
  getType,
  convert
}
