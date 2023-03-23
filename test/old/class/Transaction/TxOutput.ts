import TxScript      from './TxScript.js'
import { OutputData } from '../../schema/types.js'

export default class TxOutput {
  public value : bigint
  public scriptPubKey : TxScript

  constructor (txout : OutputData) {
    this.value  = txout.value
    this.scriptPubKey = new TxScript(txout.scriptPubKey, 'scriptPubKey')
  }
}
