import { Buff, Bytes } from '@cmdcode/buff-utils'

export function safeThrow (
  errorMsg    : string,
  shouldThrow : boolean
) : boolean {
  if (shouldThrow) {
    throw new Error(errorMsg)
  } else { return false }
}

export function hashTag (
  tag : string,
  ...data : Bytes[]
) : Buff {
  const htag = Buff.str(tag).digest.raw
  const buff = data.map(e => Buff.normalize(e))
  return Buff.join([ htag, htag, Buff.join(buff) ]).digest
}
