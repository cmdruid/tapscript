import { Buff, Bytes } from '@cmdcode/buff-utils'
import { hash }        from '@cmdcode/crypto-utils'
import { to_bytes }    from '../script/index.js'
import { check_size }  from '../utils.js'
import { ScriptData }  from '../../schema/index.js'

export function hash160pkh (pubkey : Bytes) : Buff {
  const bytes = Buff.bytes(pubkey)
  check_size(bytes, 33)
  return hash.hash160(bytes)
}

export function hash160sh (script : ScriptData) : Buff {
  const bytes = to_bytes(script, false)
  return hash.hash160(bytes)
}

export function sha256sh (script : ScriptData) : Buff {
  const bytes = to_bytes(script, false)
  return hash.sha256(bytes)
}
