import { Buff } from '@cmdcode/buff-utils'
import { Hash } from '@cmdcode/crypto-utils'
import { encodeWords, decodeWords } from '../../words.js'
import * as Type from '../../types.js'

export default class TxScript {
  
  public format : string | undefined
  public bytes  : Uint8Array

  constructor(
    script  : Type.ScriptData,
    format? : string
  ) {

    this.bytes = (Array.isArray(script))
      ? encodeWords(script)
      : Buff.hex(script).toBytes()

    this.format = format ?? undefined
  }

  get isEmpty() : boolean {
    return this.bytes.length < 1
  }

  get hex() : string {
    return Buff.buff(this.bytes).toHex()
  }

  set hex(hexstr : string) {
    this.bytes = Buff.hex(hexstr).toBytes()
  }

  get asm() : Type.WordArray {
    return decodeWords(this.bytes)
  }

  set asm(asm : Type.WordArray) {
    this.bytes = encodeWords(asm)
  }

  get hash() : Promise<string> {
    return this.format === 'scriptSig'
      ? Hash.hash160(this.bytes).then(b => Buff.buff(b).toHex())
      : Hash.hash256(this.bytes).then(b => Buff.buff(b).toHex())
  }

  toJSON() : string {
    return this.hex ?? []
  }
}
