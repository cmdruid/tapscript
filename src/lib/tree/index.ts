import * as TAPSCR  from './script.js'
import * as TAPTWK  from './tweak.js'
import * as TAPCHK  from './proof.js'

export const Tree = {
  getTag    : TAPSCR.getTapTag,
  getLeaf   : TAPSCR.getTapLeaf,
  getBranch : TAPSCR.getTapBranch,
  getRoot   : TAPSCR.getTapRoot,
  getPath   : TAPCHK.getTapPath,
  checkPath : TAPCHK.checkTapPath
}

export const Tweak = {
  getPubkey   : TAPTWK.getTapPubkey,
  getSeckey   : TAPTWK.getTapSeckey,
  getTweak    : TAPTWK.getTapTweak,
  tweakSeckey : TAPTWK.tweakPrvkey,
  tweakPubkey : TAPTWK.tweakPubkey
}
