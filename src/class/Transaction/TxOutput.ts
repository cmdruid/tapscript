import TxScript  from "./TxScript.js"
import * as Type from '../../types.js'

export default class TxOutput {
  
  public value : number
  public scriptPubKey : TxScript

  constructor(txout : Type.OutData) {
    this.value  = txout.value
    this.scriptPubKey = new TxScript(txout.scriptPubKey, 'scriptPubKey')
  }
}
