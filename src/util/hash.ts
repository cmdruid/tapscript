import { Buff, Bytes }       from '@cmdcode/buff'
import { sha256 as s256 }    from '@noble/hashes/sha256'
import { ripemd160 as r160 } from '@noble/hashes/ripemd160'

export function hash160 (...bytes : Bytes[]) {
  const preimage = Buff.join(bytes)
  const hash_256 = s256(preimage)
  const hash_160 = r160(hash_256)
  return new Buff(hash_160).hex
}

export function sha256 (...bytes : Bytes[]) {
  const preimage = Buff.join(bytes)
  const hash_256 = s256(preimage)
  return new Buff(hash_256).hex
}
