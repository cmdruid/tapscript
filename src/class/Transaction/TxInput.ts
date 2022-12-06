// import getSigHash from "../../sighash.js"
import TxScript   from "./TxScript.js"
import TxSequence from "./TxSequence.js"
import TxWitness  from "./TxWitness.js"
import * as Type  from '../../types.js'

export default class TxInput {
  
  public prevTxid  : string
  public prevOut   : number
  public scriptSig : TxScript
  public sequence  : TxSequence
  public witness   : TxWitness | undefined

  constructor(txin : Type.InData) {
    this.prevTxid  = txin.prevTxid
    this.prevOut   = txin.prevOut
    this.scriptSig = new TxScript(txin.scriptSig, 'scriptSig')
    this.sequence  = new TxSequence(txin.sequence)
    
    if (txin.witness !== undefined) {
      this.witness = new TxWitness(txin.witness)
    }
  }
}
