import { hashTx }   from './hash.js'
import { signTx }   from './sign.js'
import { verifyTx } from './verify.js'

export const TapRootSigner = {
  hash   : hashTx,
  sign   : signTx,
  verify : verifyTx
}
