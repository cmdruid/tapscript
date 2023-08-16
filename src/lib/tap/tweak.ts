import { Buff, Bytes } from '@cmdcode/buff-utils'
import { parse_xonly } from './utils.js'

import {
  Field,
  Point,
  keys,
  hash
} from '@cmdcode/crypto-utils'

const { digest } = hash

export function get_tweak (
  key   : Bytes,
  data  : Bytes = new Uint8Array(),
  isPrivate = false
) : Buff {
  const pub = (isPrivate)
    ? keys.get_pubkey(key, true)
    : parse_xonly(key)
  return digest('TapTweak', pub, data)
}

export function get_tweaked_key (
  intkey  : Bytes,
  data   ?: Bytes,
  isPrivate = false
) : Buff {
  if (data === undefined) data = new Uint8Array()
  const k = Buff.bytes(intkey)
  // Calculate the tweak.
  const t = get_tweak(intkey, data, isPrivate)
  // Return the tweaked key based on type.
  if (isPrivate) {
    // Return tweaked private key.
    return tweak_seckey(k, t)
  } else {
    // Return tweaked public key.
    return tweak_pubkey(k, t)
  }
}

export function tweak_seckey (
  seckey : Bytes,
  tweak  : Bytes
) : Buff {
  let sec = Field.mod(seckey)
  if (sec.point.hasOddY) {
    sec = sec.negate()
  }
  return Buff.raw(sec.add(tweak).raw)
}

export function tweak_pubkey (
  pubkey : Bytes,
  tweak  : Bytes
) : Buff {
  pubkey = parse_xonly(pubkey)
  const P = Point.from_x(pubkey)
  const Q = P.add(tweak)
  return Buff.raw(Q.raw)
}

function get_script_only_pub () : Buff {
  // Generated as specified in BIP0341:
  // https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki
  const G = Buff.hex('0479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8')
  return Point.from_x(G.digest).x
}

export const SCRIPT_PUBKEY = get_script_only_pub()
