import { Buff, Bytes } from '@cmdcode/buff-utils'

import {
  Field,
  Point,
  hash,
  keys
} from '@cmdcode/crypto-utils'

import * as assert from '../assert.js'

const { digest } = hash

export function get_tweak (
  pubkey : Bytes,
  data  ?: Bytes
) : Buff {
  data = data ?? new Uint8Array()
  assert.size(pubkey, 32)
  return digest('TapTweak', pubkey, data)
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
  const pub = keys.convert_32(pubkey)
  return Point.from_x(pub).add(tweak).buff
}
