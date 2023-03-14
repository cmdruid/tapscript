import { encodeTx }     from './lib/tx/encode.js'
import { decodeTx }     from './lib/tx/decode.js'
import { encodeScript } from './lib/script/encode.js'
import { decodeScript } from './lib/script/decode.js'
import { segwitHash  }  from './lib/sig/segwit.js'

import * as SIG  from './lib/sig/taproot.js'
import * as TAP  from './lib/tap/script.js'
import * as TWK  from './lib/tap/tweak.js'
import * as CHK  from './lib/tap/proof.js'

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
  getPath       : CHK.getTapPath,
  checkPath     : CHK.checkTapPath,
  encodeAddress : TAP.encodeTapAddress,
  decodeAddress : TAP.decodeTapAddress
}

export const Tweak = {
  getPubkey   : TWK.getTapPubkey,
  getSeckey   : TWK.getTapSeckey,
  getTweak    : TWK.getTapTweak,
  tweakSeckey : TWK.tweakPrvkey,
  tweakPubkey : TWK.tweakPubkey
}

export const Tx = {
  encode : encodeTx,
  decode : decodeTx
}
