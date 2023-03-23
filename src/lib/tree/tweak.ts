import { Buff }                  from '@cmdcode/buff-utils'
import { Field, Point }          from '@cmdcode/crypto-utils'
import { getTapTag, getTapRoot } from './script.js'
import { TapTree, TapKey }       from './types.js'

export function tweakPrvkey (
  prvkey : string | Uint8Array,
  tweak  : string | Uint8Array
) : Uint8Array {
  let sec = new Field(prvkey)
  if (sec.point.hasOddY) {
    sec = sec.negate()
  }
  return sec.add(tweak).raw
}

export function tweakPubkey (
  pubkey : string | Uint8Array,
  tweak  : string | Uint8Array
) : Uint8Array {
  const P = new Point(pubkey)
  const Q = P.add(tweak)
  return Q.raw
}

export function getTapTweak (
  pubkey : string | Uint8Array,
  tweak  : string | Uint8Array
) : Buff {
  return Buff.join([
    getTapTag('TapTweak'),
    Buff.normalize(pubkey),
    Buff.normalize(tweak)
  ]).digest
}

function getTapKey (
  intkey : string | Uint8Array,
  leaves : TapTree = [],
  isPrivate = false
) : TapKey {
  const k = Buff.normalize(intkey)
  // Get the merkle root data.
  const r = (leaves.length > 0)
    ? getTapRoot(leaves)
    : new Uint8Array()
  // Get the pubkey for the tweak.
  const P = (isPrivate)
    ? new Field(k).point.rawX
    : k
  // Calculate the tweak.
  const t = getTapTweak(P, r)
  // Return the tweaked key based on type.
  if (isPrivate) {
    // Return tweaked private key.
    return [ Buff.raw(tweakPrvkey(k, t)).hex, 0 ]
  } else {
    // Return tweaked public key.
    const p = Buff.raw(tweakPubkey(k, t))
    return [ p.slice(1).hex, p.slice(0, 1).num ]
  }
}

export function getTapPubkey (
  pubkey : string | Uint8Array,
  leaves : TapTree = []
) : TapKey {
  return getTapKey(pubkey, leaves)
}

export function getTapSeckey (
  seckey : string | Uint8Array,
  leaves : TapTree = []
) : string {
  return getTapKey(seckey, leaves, true)[0]
}
