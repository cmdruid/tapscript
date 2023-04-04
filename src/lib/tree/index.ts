import * as SCR  from './script.js'
import * as TWK  from './tweak.js'
import * as CHK  from './proof.js'

export const TapTree = {
  getTag    : SCR.getTapTag,
  getLeaf   : SCR.getTapLeaf,
  getBranch : SCR.getTapBranch,
  getRoot   : SCR.getTapRoot
}

export const TapKey = {
  tapPubKey   : CHK.getTapPubKey,
  tapSecKey   : CHK.getTapSecKey,
  checkScript : CHK.checkTapScript,
  checkData   : CHK.checkTapData,
  checkLeaf   : CHK.checkTapLeaf
}

export const TapTweak = {
  getPubKey   : TWK.getTweakedPub,
  getSecKey   : TWK.getTweakedSec,
  getTweak    : TWK.getTapTweak,
  tweakSecKey : TWK.tweakSecKey,
  tweakPubKey : TWK.tweakSecKey
}
