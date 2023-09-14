import { Buff, Bytes }  from '@cmdcode/buff'
import { Field, Point } from '@cmdcode/crypto-tools'
import { hash340 }      from '@cmdcode/crypto-tools/hash'
import { convert_32b }  from '@cmdcode/crypto-tools/keys'

import * as assert from '../assert.js'

export function get_taptweak (
  pubkey : Bytes,
  data  ?: Bytes
) : Buff {
  data = data ?? new Uint8Array()
  assert.size(pubkey, 32)
  return hash340('TapTweak', pubkey, data)
}

export function tweak_seckey (
  seckey : Bytes,
  tweak  : Bytes
) : Buff {
  return Field.mod(seckey).negated.add(tweak).buff
}

export function tweak_pubkey (
  pubkey : Bytes,
  tweak  : Bytes
) : Buff {
  const pub = convert_32b(pubkey)
  return Point.from_x(pub).add(tweak).buff
}
