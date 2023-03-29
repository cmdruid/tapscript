import { segwitHash  } from './segwit.js'
import * as TAPSIG     from './taproot.js'

export const Sig = {
  segwit: {
    hash: segwitHash
  },
  taproot: {
    hash   : TAPSIG.hashTx,
    sign   : TAPSIG.signTx,
    verify : TAPSIG.verifyTx
  }
}
