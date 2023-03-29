// import getSigHash from "../../sighash.js"
import TxScript      from './TxScript.js'
import TxSequence    from './TxSequence.js'
import TxOutput      from './TxOutput.js'
import TxWitness     from './TxWitness.js'
import { InputData } from '../../schema/types.js'

export default class TxInput {
  public txid      : string
  public vout      : number
  public scriptSig : TxScript
  public sequence  : TxSequence
  public prevout   : TxOutput  | undefined
  public witness   : TxWitness | undefined

  constructor (txin : InputData) {
    const { 
      scriptSig = [], 
      sequence  = 0xfffffffd,
      witness   = []
    } = txin

    this.txid      = txin.txid
    this.vout      = txin.vout
    this.scriptSig = new TxScript(scriptSig)
    this.sequence  = new TxSequence(sequence)
    this.witness   = new TxWitness(witness)

    if (txin.prevout !== undefined) {
      this.prevout = new TxOutput(txin.prevout)
    }
  }
}
