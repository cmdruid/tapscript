import { Buff }    from '@cmdcode/buff'

import * as Script from '../lib/script/index.js'
import * as Tx     from '../lib/tx/index.js'

import {
  ScriptData,
  WitnessData
} from '../types/index.js'

export class Witness {
  readonly _data : ScriptData[]
  readonly _meta : WitnessData

  constructor (witness : ScriptData[],) {
    this._data = witness
    this._meta = Tx.parse_witness(witness)
  }

  get length () : number {
    return this._data.length
  }

  get annex () : string | undefined {
    const annex = this._meta.annex
    return (annex !== null)
      ? Buff.raw(annex).hex
      : undefined
  }

  get cblock () : string | undefined {
    const cblock = this._meta.cblock
    return (cblock !== null)
      ? Buff.raw(cblock).hex
      : undefined
  }

  get data () : ScriptData[] {
    return this._data
  }

  get script () : ScriptData | undefined {
    const script = this._meta.script
    return (script !== null)
      ? Script.decode(script)
      : undefined
  }

  get params () : Buff[] {
    return this._meta.params
  }

  toJSON () : ScriptData[] {
    return this.data
  }
}
