import { Buff }          from '@cmdcode/buff'
import { decode_script } from './decode.js'
import { encode_script } from './encode.js'
import { is_bytes }      from '../util.js'

import {
  ScriptData,
  Word
} from '../../types/index.js'

export function to_asm (
  script  : ScriptData,
  varint ?: boolean
) : Word[] {
  if (Array.isArray(script)) {
    script = encode_script(script, varint)
  }
  if (is_bytes(script)) {
    return decode_script(script, varint)
  }
  throw new Error('Invalid script format: ' + String(script))
}

export function to_bytes (
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
