import TxScript from "./TxScript.js"

export default class TxWitness {
  
  public args   : string[]
  public script : TxScript

  constructor(data : string[]) {
    this.args   = data
    this.script = (this.args.length > 2)
      ? new TxScript(this.args.pop() ?? '', 'witness')
      : new TxScript([], 'witness')
  }

  get data() : string[] {
    return this.script instanceof TxScript
      ? [ ...this.args, this.script.hex ]
      : this.args
  }

  toJSON() : string[] {
    return this.data
  }
}
