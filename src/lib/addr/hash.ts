import { Buff, Bytes } from '@cmdcode/buff'
import { Script }      from '../script/index.js'
import { checkSize }   from '../utils.js'
import { ScriptData }  from '../../schema/types.js'
import { hash160, sha256 } from '@cmdcode/crypto-tools/hash'

export function hash160pkh (pubkey : Bytes) : Buff {
  const bytes = Buff.bytes(pubkey)
  checkSize(bytes, 33)
  return hash160(bytes)
}

export function hash160sh (script : ScriptData) : Buff {
  const bytes = Script.fmt.toBytes(script, false)
  return hash160(bytes)
}

export function sha256sh (script : ScriptData) : Buff {
  const bytes = Script.fmt.toBytes(script, false)
  return sha256(bytes)
}
