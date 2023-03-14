import { Buff }                    from '@cmdcode/buff-utils'
import { Field, Hash, Point, Noble }     from '@cmdcode/crypto-utils'
import { getTapTag, getTapRoot } from './script.js'
import { TapTree, TapKey }         from './types.js'

export function tweakPrvkey (
  prvkey : string | Uint8Array,
  tweak  : string | Uint8Array
) : Uint8Array {
  let sec = new Field(prvkey)
  if (sec.point.hasOddY) {
    sec = sec.negate()
  }
  return sec.add(tweak)
}

export function tweakPubkey (
  pubkey : string | Uint8Array,
  tweak  : string | Uint8Array
) : Uint8Array {
  const P = Point.fromX(pubkey)
  const Q = P.add(tweak)
  return Q.rawX
}

export async function getTapTweak (
  pubkey : string | Uint8Array,
  tweak  : string | Uint8Array
) : Promise<Uint8Array> {
  return Hash.sha256(Uint8Array.of(
    ...await getTapTag('TapTweak'),
    ...Buff.normalize(pubkey),
    ...Buff.normalize(tweak)
  ))
}

async function getTapKey (
  intkey : string | Uint8Array,
  leaves : TapTree = [],
  isPrivate = false
) : Promise<TapKey> {
  const k = Buff.normalize(intkey)
  // Get the merkle root data.
  const r = (leaves.length > 0)
    ? await getTapRoot(leaves)
    : new Uint8Array()
  // Get the pubkey for the tweak.
  const P = (isPrivate)
    ? Noble.getPublicKey(k, true).slice(1)
    : k
  // Calculate the tweak.
  const t = await getTapTweak(P, r)
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

export async function getTapPubkey (
  pubkey : string | Uint8Array,
  leaves : TapTree = []
) : Promise<TapKey> {
  return getTapKey(pubkey, leaves)
}

export async function getTapSeckey (
  seckey : string | Uint8Array,
  leaves : TapTree = []
) : Promise<string> {
  return getTapKey(seckey, leaves, true).then(ret => ret[0])
}
