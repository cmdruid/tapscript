import { Buff, Bytes } from '@cmdcode/buff'
import { hash }        from '@cmdcode/crypto-tools'
import { to_bytes }    from '../script/index.js'
import { ScriptData }  from '../../types/index.js'

import * as assert from '../assert.js'

export function hash160pkh (pubkey : Bytes) : Buff {
  const bytes = Buff.bytes(pubkey)
  assert.size(bytes, 33)
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
