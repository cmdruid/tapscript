import { Buff, Bytes } from '@cmdcode/buff-utils'

export function xOnlyPub (key : Bytes) : Buff {
  const bytes = Buff.bytes(key)
  return (bytes.length > 32) ? bytes.slice(1, 33) : bytes
}
