import { SegwitSigner }  from './segwit/index.js'
import { TapRootSigner } from './taproot/index.js'

export const Sig = {
  segwit  : SegwitSigner,
  taproot : TapRootSigner
}
