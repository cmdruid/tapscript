import { encodeTx }     from './lib/tx/encode.js'
import { decodeTx }     from './lib/tx/decode.js'
import { encodeScript } from './lib/script/encode.js'
import { decodeScript } from './lib/script/decode.js'
import { segwitHash  }  from './lib/sig/segwit.js'
import * as SIG  from './lib/sig/taproot.js'
import * as TAP  from './lib/tap/script.js'

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
    hash   : SIG.taprootHash,
    sign   : SIG.taprootSign,
    verify : SIG.taprootVerify
  }
}

export const Tap = {
  getTag        : TAP.getTapTag,
  getLeaf       : TAP.getTapLeaf,
  getBranch     : TAP.getTapBranch,
  getRoot       : TAP.getTapRoot,
  getTweak      : TAP.getTapTweak,
  getPubkey     : TAP.getTapPubkey,
  getSeckey     : TAP.getTapSeckey,
  getPath       : TAP.getTapPath,
  checkPath     : TAP.checkTapPath,
  tweakSeckey   : TAP.tweakPrvkey,
  tweakPubkey   : TAP.tweakPubkey,
  encodeAddress : TAP.encodeTapAddress,
  decodeAddress : TAP.decodeTapAddress
}

export const Tx = {
  encode : encodeTx,
  decode : decodeTx
}
