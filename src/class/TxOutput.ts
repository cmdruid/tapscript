import { ScriptKey }  from './ScriptKey.js'
import { OutputData, ValueData } from '../schema/index.js'

export class TxOutput {
  readonly _data : OutputData
  readonly _idx ?: number

  constructor (
    txout : OutputData,
    idx  ?: number
  ) {
    this._data = txout
    this._idx  = idx
  }

  get data () : OutputData {
    return this._data
  }

    get idx () : number | undefined {
    return this._idx
  }

  get value () : ValueData {
    return this._data.value
  }

  get script () : ScriptKey {
    return new ScriptKey(this._data.scriptPubKey)
  }

  toJSON () : OutputData {
    return this.data
  }
}
