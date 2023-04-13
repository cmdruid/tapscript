import TxScript from './TxScript.js'
import { readScriptPubKey } from '../../lib/tx/parse.js'
import { OutputData, OutputType } from '../../schema/types.js'

export default class TxOutput {
  value : bigint
  scriptPubKey : TxScript

  constructor (txout : OutputData) {
    this.value = BigInt(txout.value)
    this.scriptPubKey = new TxScript(txout.scriptPubKey)
  }

  get type () : OutputType {
    const { type } = readScriptPubKey(this.scriptPubKey.raw)
    return type
  }
}
