import { Buff }        from '@cmdcode/buff'
import { readWitness } from '../../lib/tx/parse.js'
import { Script }      from '../../lib/script/index.js'
import { Bytes, InputType, ScriptData, WitnessData } from '../../schema/types.js'

export default class TxWitness {
  readonly format ?: InputType
  readonly _data   : ScriptData[]
  readonly _meta   : WitnessData

  constructor (
    data    : ScriptData[],
    format ?: InputType
  ) {
    this._data  = data
    this._meta  = readWitness(data)
    this.format = format
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

  get script () : ScriptData | undefined {
    const script = this._meta.script
    return (script !== null)
      ? Script.decode(script)
      : undefined
  }

  get params () : Bytes[] {
    return this._meta.params
  }

  toJSON () : ScriptData[] {
    return this._data
  }
}
