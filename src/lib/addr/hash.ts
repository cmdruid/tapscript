import { Buff, Bytes } from '@cmdcode/buff-utils'
import { Script }      from '../script/index.js'
import { checkSize }   from '../utils.js'
import { ScriptData }  from '../../schema/types.js'

export function hash160pkh (pubkey : Bytes) : Buff {
  const bytes = Buff.bytes(pubkey)
  checkSize(bytes, 33)
  return bytes.toHash('hash160')
}

export function hash160sh (script : ScriptData) : Buff {
  const bytes = Script.fmt.toBytes(script, false)
  return bytes.toHash('hash160')
}

export function sha256sh (script : ScriptData) : Buff {
  const bytes = Script.fmt.toBytes(script, false)
  return bytes.toHash('sha256')
}
