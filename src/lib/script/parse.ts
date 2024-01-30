import { Buff }          from '@cmdcode/buff'
import { SCRIPT_TYPES }  from './const.js'
import { decode_script } from './decode.js'
import { encode_script } from './encode.js'

import {
  is_bytes,
  is_hex
} from '../util.js'

import {
  ScriptData,
  ScriptMeta,
  ScriptRaw,
  ScriptWord
} from '../../types/index.js'


export function parse_script (
  script : ScriptData
) : ScriptMeta | ScriptRaw {
  const hex = buffer_asm(script, false).hex
  for (const [ type, pattern ] of SCRIPT_TYPES) {
    const { groups } = pattern.exec(hex) ?? {}
    const { hash   } = groups ?? {}
    if (is_hex(hash)) {
      return {
        type,
        hex,
        key : Buff.hex(hash),
        asm : parse_asm(script, false)
      }
    }
  }
  return { type: 'raw', hex, asm: parse_asm(script, false) }
}

export function parse_asm (
  script  : ScriptData,
  varint ?: boolean
) : ScriptWord[] {
  if (Array.isArray(script)) {
    script = encode_script(script, varint)
  }
  if (is_bytes(script)) {
    return decode_script(script, varint)
  }
  throw new Error('Invalid script format: ' + String(script))
}

export function buffer_asm (
  script  : ScriptData,
  varint ?: boolean
) : Buff {
  if (is_bytes(script)) {
    script = decode_script(script, varint)
  }
  if (Array.isArray(script)) {
    return encode_script(script, varint)
  }
  throw new Error('Invalid script format: ' + String(script))
}
