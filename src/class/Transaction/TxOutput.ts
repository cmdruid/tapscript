import TxScript from './TxScript.js'

import { OutputData } from '../../schema/types.js'

export default class TxOutput {
  value : bigint
  scriptPubKey : TxScript

  constructor (txout : OutputData) {
    this.value = BigInt(txout.value)
    this.scriptPubKey = new TxScript(txout.scriptPubKey)
  }

  // get type () : OutputType {
  //   return getScriptType(this.scriptPubKey)
  // }
}
