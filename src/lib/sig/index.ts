import { SWSigner } from './segwit/index.js'
import { TRSigner } from './taproot/index.js'

export const Signer = {
  segwit  : SWSigner,
  taproot : TRSigner
}
