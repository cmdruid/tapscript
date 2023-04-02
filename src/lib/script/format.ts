import { Buff } from '@cmdcode/buff-utils'
import { isHex }        from '../check.js'
import { decodeScript } from './decode.js'
import { encodeScript } from './encode.js'
import { ScriptData }   from '../../schema/types.js'

function toAsm (
  script ?: ScriptData
) : string[] {
  if (Array.isArray(script)) {
    script = encodeScript(script)
  }
  if (
    script instanceof Uint8Array ||
    isHex(script)
  ) {
    return decodeScript(script)
  }
  throw new Error('Invalid format: ' + String(typeof script))
}

function toBytes (
  script ?: ScriptData
) : Buff {
  if (
    script instanceof Uint8Array ||
    isHex(script)
  ) { script = decodeScript(script) }
  if (Array.isArray(script)) {
    return encodeScript(script)
  }
  throw new Error('Invalid format: ' + String(typeof script))
}

function toParam (
  script : ScriptData
) : Buff {
  if (!Array.isArray(script)) {
    return Buff.bytes(script)
  }
  throw new Error('Invalid format: ' + String(typeof script))
}

export const FmtScript = {
  toAsm,
  toBytes,
  toParam
}
