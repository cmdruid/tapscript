import { parse_sequence } from '../lib/tx/sequence.js'
import { SequenceData } from '../types/index.js'

export class Sequence {
  readonly _data : SequenceData

  constructor (value : number) {
    this._data = parse_sequence(value)
  }

  get data () : SequenceData {
    return this._data
  }

  get value () : number {
    return this._data.value
  }

  get is_replaceable () : boolean {
    return this.data.enabled
  }

  toJSON () : number {
    return this.value
  }
}
