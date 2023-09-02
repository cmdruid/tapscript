import { hash } from '@cmdcode/crypto-utils'

import * as Address from '../lib/address/index.js'
import * as Script  from '../lib/script/index.js'
import * as Tap     from '../lib/tap/index.js'

import {
  ScriptData,
  ScriptEnum,
  ScriptMeta,
  Word
} from '../types/index.js'

const { hash160, hash256 } = hash

export class ScriptKey {
  readonly _data : ScriptMeta

  constructor(
    script : ScriptData,
  ) {
    this._data = Script.parse_scriptkey(script)
  }

  get address () : string {
    return Address.from_script(this.asm)
  }

  get asm () : Word[] {
    return this._data.asm
  }

  get hash () : string {
    switch (this.type) {
      case 'p2sh':
        return hash160(this.hex).hex
      case 'p2w-sh':
        return hash256(this.hex).hex
      case 'p2tr':
        return Tap.encode.leaf(this.hex)
      default:
        throw new Error('Unrecognized script format: ' + this.type)
    }
  }

  get hex () : string {
    return this._data.hex
  }

  get type () : ScriptEnum | 'raw' {
    return this._data.type
  }

  toJSON() : Word[] {
    return this.asm
  }
}
