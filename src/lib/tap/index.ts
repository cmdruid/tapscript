import * as SCR  from './tree.js'
import * as TWK  from './tweak.js'
import * as CHK  from './key.js'

export const TapTree = {
  getTag    : SCR.getTapTag,
  getLeaf   : SCR.getTapLeaf,
  getBranch : SCR.getTapBranch,
  getRoot   : SCR.getTapRoot
}

export const TapUtil = {
  readCtrlBlock : CHK.readCtrlBlock,
  readParityBit : CHK.readParityBit
}

export const TapTweak = {
  getPubKey   : TWK.getTweakedPub,
  getSecKey   : TWK.getTweakedSec,
  getTweak    : TWK.getTapTweak,
  tweakSecKey : TWK.tweakSecKey,
  tweakPubKey : TWK.tweakPubKey
}

export const Tap = {
  getPubKey    : CHK.getTapPubKey,
  getSecKey    : CHK.getTapSecKey,
  encodeScript : SCR.getTapScript,
  checkPath    : CHK.checkPath,
  tree         : TapTree,
  tweak        : TapTweak,
  util         : TapUtil
}
