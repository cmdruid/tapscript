import { Buff, Bytes }     from '@cmdcode/buff'
import { hash160, sha256 } from '@cmdcode/crypto-tools/hash'
import { assert }          from '@/util/index.js'
import { Script }          from '@/module/script/index.js'

import type { ScriptData } from '@/types/index.js'

export function hash160pkh (pubkey : Bytes) : Buff {
  const bytes = Buff.bytes(pubkey)
  assert.size(bytes, 33)
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
