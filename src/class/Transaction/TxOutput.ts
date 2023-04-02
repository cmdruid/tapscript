import TxScript from './TxScript.js'
import { Tx }   from '../../lib/tx/index.js'

import { OutputData, OutputType } from '../../schema/types.js'

export default class TxOutput {
  value : bigint
  scriptPubKey : TxScript

  constructor (txout : OutputData) {
    const script = Tx.parse.scriptPubKey(txout)
    this.value = BigInt(txout.value)
    this.scriptPubKey = new TxScript(script)
  }

  // get type () : OutputType {
  //   return getScriptType(this.scriptPubKey)
  // }
}
