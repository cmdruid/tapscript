import { Buff } from '@cmdcode/buff-utils'

import { encodeScript } from '../../lib/script/encode.js'
import { decodeScript } from '../../lib/script/decode.js'

import { ScriptData } from '../../schema/types.js'

type ScriptFormat = 'p2sh' | 'p2w'

export default class TxScript {
  readonly _buff : Buff
  format : ScriptFormat

  constructor(
    script : ScriptData,
    format : ScriptFormat = 'p2w'
  ) {
    this._buff  = Buff.raw(encodeScript(script))
    this.format = format
  }

  get raw () : Uint8Array {
    return this._buff.raw
  }

  get hex () : string {
    return this._buff.hex
  }

  get asm () : string[] {
    return decodeScript(this._buff, 'asm')
  }

  get hash () : string {
    switch (this.format) {
      case 'p2w':
        return this._buff.toHash('hash256').hex
      case 'p2sh':
        return this._buff.toHash('hash160').hex
      default:
        throw new Error('Unrecognized format: ' + this.format)
    }
  }

  get isEmpty () : boolean {
    return this.raw.length < 1
  }

  toJSON() : string[] {
    return this.asm ?? []
  }
}
