import { Buff }         from '@cmdcode/buff-utils'
import { encodeScript } from '../../lib/script/encode.js'
import { decodeScript } from '../../lib/script/decode.js'
import { ScriptData }   from '../../schema/types.js'
import { TapTree }      from '../../lib/tap/index.js'
import { hash160, hash256 } from '@cmdcode/crypto-utils'

type ScriptFormat = 'p2sh' | 'p2w' | 'p2tr'

export default class TxScript {
  readonly _buff : Buff

  constructor(
    script : ScriptData,
  ) {
    this._buff = Buff.raw(encodeScript(script))
  }

  get raw () : Uint8Array {
    return this._buff.raw
  }

  get hex () : string {
    return this._buff.hex
  }

  get asm () : string[] {
    return decodeScript(this._buff)
  }

  getHash (format : ScriptFormat, version ?: number) : string {
    switch (format) {
      case 'p2w':
        return hash256(this._buff).hex
      case 'p2sh':
        return hash160(this._buff).hex
      case 'p2tr':
        return TapTree.getLeaf(this._buff, version)
      default:
        throw new Error('Unrecognized format: ' + format)
    }
  }

  toJSON() : string[] {
    return this.asm ?? []
  }
}
