import { create_addr }  from '../lib/addr/parse.js'
import { parse_script } from '../lib/script/parse.js'

import {
  ScriptData,
  ScriptEnum,
  ScriptMeta,
  ScriptWord
} from '../types/index.js'

export class ScriptKey {
  readonly _data : ScriptMeta

  constructor (script : ScriptData) {
    this._data = parse_script(script)
  }

  get address () : string {
    return create_addr(this.asm)
  }

  get asm () : ScriptWord[] {
    return this._data.asm
  }

  get hex () : string {
    return this._data.hex
  }

  get type () : ScriptEnum | 'raw' {
    return this._data.type
  }

  toJSON () : ScriptWord[] {
    return this.asm
  }
}
