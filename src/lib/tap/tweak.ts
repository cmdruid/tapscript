import { Buff }         from '@cmdcode/buff-utils'
import { Field, Point } from '@cmdcode/crypto-utils'
import { getTapTag }    from './tree.js'
import { xOnlyPub }     from './utils.js'
import { Bytes }        from '../../schema/types.js'

export function getTapTweak (
  key   : Bytes,
  data  : Bytes = new Uint8Array(),
  isPrivate = false
) : Buff {
  const pub = (isPrivate)
    ? new Field(key).point.x.raw
    : xOnlyPub(key)
  return Buff.join([ getTapTag('TapTweak'), pub, Buff.bytes(data) ]).digest
}

export function getTweakedKey (
  intkey  : Bytes,
  data   ?: Bytes,
  isPrivate = false
) : Buff {
  if (data === undefined) data = new Uint8Array()
  const k = Buff.bytes(intkey)
  // Calculate the tweak.
  const t = getTapTweak(intkey, data, isPrivate)
  // Return the tweaked key based on type.
  if (isPrivate) {
    // Return tweaked private key.
    return tweakSecKey(k, t)
  } else {
    // Return tweaked public key.
    return tweakPubKey(k, t)
  }
}

export function getTweakedPub (
  pubkey  : Bytes,
  data   ?: Bytes
) : Buff {
  return getTweakedKey(pubkey, data)
}

export function getTweakedSec (
  seckey  : Bytes,
  data   ?: Bytes
) : Buff {
  return getTweakedKey(seckey, data, true)
}

export function tweakSecKey (
  seckey : Bytes,
  tweak  : Bytes
) : Buff {
  let sec = new Field(seckey)
  if (sec.point.hasOddY) {
    sec = sec.negate()
  }
  return Buff.raw(sec.add(tweak).raw)
}

export function tweakPubKey (
  pubkey : Bytes,
  tweak  : Bytes
) : Buff {
  pubkey = xOnlyPub(pubkey)
  const P = new Point(pubkey)
  const Q = P.add(tweak)
  return Buff.raw(Q.raw)
}

function getScriptOnlyPubkey () : Buff {
  // Generated as specified in BIP0341:
  // https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki
  const G = Buff.hex('0479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8')
  return new Point(G.digest).x
}

export const SCRIPT_PUBKEY = getScriptOnlyPubkey()
