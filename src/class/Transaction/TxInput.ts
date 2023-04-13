// import getSigHash from "../../sighash.js"
import TxScript       from './TxScript.js'
import TxSequence     from './TxSequence.js'
import TxOutput       from './TxOutput.js'
import TxWitness      from './TxWitness.js'
import { Signer }     from '../../lib/sig/index.js'
import { HashConfig } from '../../lib/sig/types.js'
import { readScriptPubKey } from '../../lib/tx/parse.js'
import { Bytes, InputData, InputType, TxData } from '../../schema/types.js'

export default class TxInput {
  readonly _tx : TxData
  readonly idx : number

  constructor (txdata : TxData, index : number) {
    this._tx = txdata
    this.idx = index
  }

  get data () : InputData {
    return this._tx.vin[this.idx]
  }

  get txid () : string {
    return this.data.txid
  }

  get vout () : number {
    return this.data.vout
  }

  get prevout () : TxOutput | undefined {
    return (this.data.prevout !== undefined)
      ? new TxOutput(this.data.prevout)
      : undefined
  }

  get scriptSig () : TxScript {
    return new TxScript(this.data.scriptSig)
  }

  get sequence () : TxSequence {
    return new TxSequence(this.data.sequence)
  }

  get witness () : TxWitness {
    return new TxWitness(this.data.witness)
  }

  get type () : InputType {
    if (this.prevout !== undefined) {
      const script = this.prevout.scriptPubKey.raw
      const { type } = readScriptPubKey(script)
      if (type === 'p2sh') {
        const asm = this.scriptSig.asm
        if (asm[0] === 'OP_0') {
          if (asm[1].length === 20) {
            return 'p2w-p2pkh'
          }
          if (asm[1].length === 32) {
            return 'p2w-p2sh'
          }
        }
        return 'p2sh'
      }
      return type
    }
    return 'raw'
  }

  sign (seckey : Bytes, config : HashConfig) {
    if (this.type.startsWith('p2w')) {
      return Signer.segwit.sign(seckey, this._tx, this.idx, config)
    }
    if (this.type.startsWith('p2tr')) {
      return Signer.taproot.sign(seckey, this._tx, this.idx, config)
    }
    if (
      this.type.startsWith('p2pkh') ||
      this.type.startsWith('p2sh')
    ) {
      throw new Error('This library does not support signing legacy transactions.')
    }
    throw new Error('Unable to sign this input type:' + String(this.type))
  }
}
