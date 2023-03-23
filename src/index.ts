import { encodeTx }     from './lib/tx/encode.js'
import { decodeTx }     from './lib/tx/decode.js'
import { encodeScript } from './lib/script/encode.js'
import { decodeScript } from './lib/script/decode.js'
import { segwitHash  }  from './lib/sig/segwit.js'

import * as TAPSIG  from './lib/sig/taproot.js'
import * as TAPSCR  from './lib/tree/script.js'
import * as TAPTWK  from './lib/tree/tweak.js'
import * as TAPCHK  from './lib/tree/proof.js'

export { Address }  from './lib/addr/index.js'

export * from './schema/types.js'

export const Script = {
  encode : encodeScript,
  decode : decodeScript
}

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

export const Tree = {
  getTag        : TAPSCR.getTapTag,
  getLeaf       : TAPSCR.getTapLeaf,
  getBranch     : TAPSCR.getTapBranch,
  getRoot       : TAPSCR.getTapRoot,
  getPath       : TAPCHK.getTapPath,
  checkPath     : TAPCHK.checkTapPath,
  encodeAddress : TAPSCR.encodeTapAddress,
  decodeAddress : TAPSCR.decodeTapAddress
}

export const Tweak = {
  getPubkey   : TAPTWK.getTapPubkey,
  getSeckey   : TAPTWK.getTapSeckey,
  getTweak    : TAPTWK.getTapTweak,
  tweakSeckey : TAPTWK.tweakPrvkey,
  tweakPubkey : TAPTWK.tweakPubkey
}

export const Tx = {
  encode : encodeTx,
  decode : decodeTx
}
