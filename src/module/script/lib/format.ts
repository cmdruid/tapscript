import { Buff }         from '@cmdcode/buff'
import { check }        from '@/util/index.js'
import { decodeScript } from './decode.js'
import { encodeScript } from './encode.js'

import type { ScriptData } from '@/types/index.js'

function toAsm (
  script ?: ScriptData,
  varint ?: boolean
) : string[] {
  if (Array.isArray(script)) {
    script = encodeScript(script, varint)
  }
  if (
    script instanceof Uint8Array ||
    check.is_hex(script)
  ) {
    return decodeScript(script, varint)
  }
  throw new Error('Invalid format: ' + String(typeof script))
}

function toBytes (
  script ?: ScriptData,
  varint ?: boolean
) : Buff {
  if (
    script instanceof Uint8Array ||
    check.is_hex(script)
  ) { script = decodeScript(script, varint) }
  if (Array.isArray(script)) {
    return encodeScript(script, varint)
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
