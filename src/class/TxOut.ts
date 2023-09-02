import { ScriptKey } from './ScriptKey.js'
import { TxOutput }  from '../types/index.js'

export class TxOut {
  readonly _data : TxOutput
  readonly _idx ?: number

  constructor (
    txout : TxOutput,
    idx  ?: number
  ) {
    this._data = txout
    this._idx  = idx
  }

  get data () : TxOutput {
    return this._data
  }

    get idx () : number | undefined {
    return this._idx
  }

  get value () : bigint {
    return this._data.value
  }

  get script () : ScriptKey {
    return new ScriptKey(this._data.scriptPubKey)
  }

  toJSON () : TxOutput {
    return this.data
  }
}
