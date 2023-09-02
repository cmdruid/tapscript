
import { Buff }         from '@cmdcode/buff-utils'
import { SCRIPT_TYPES } from './const.js'
import { is_hex }       from '../util.js'

import {
  to_asm,
  to_bytes
} from './format.js'

import {
  ScriptData,
  ScriptMeta
} from '../../types/index.js'

export function parse_scriptkey (
  script : ScriptData
) : ScriptMeta {
  const hex = to_bytes(script, false).hex
  for (const [ type, pattern ] of SCRIPT_TYPES) {
    const { groups } = pattern.exec(hex) ?? {}
    const { hash   } = groups ?? {}
    if (is_hex(hash)) {
      return {
        type,
        hex,
        data : Buff.hex(hash),
        asm  : to_asm(script, false)
      }
    }
  }
  return { type: 'raw', hex, asm: to_asm(script, false) }
}
