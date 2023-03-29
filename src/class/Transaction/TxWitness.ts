import { WitnessData } from '../../schema/types.js'
import TxScript from './TxScript.js'

export default class TxWitness {
  public args   : string[]
  public script : TxScript

  constructor (data : WitnessData) {
    this.args = (data.length > 2)
      ? data.slice(0, -1) as string[]
      : data as string[]
    this.script = (data.length > 2)
      ? new TxScript(this.args.pop() ?? '')
      : new TxScript([])
  }

  get data () : string[] {
    return this.script instanceof TxScript
      ? [ ...this.args, this.script.hex ]
      : this.args
  }

  toJSON () : string[] {
    return this.data
  }
}
