import { Buff, Bytes } from '@cmdcode/buff-utils'

export function checkSize (input : Bytes, size : number) : void {
  const bytes = Buff.bytes(input)
  if (bytes.length !== size) {
    throw new Error(`Invalid input size: ${bytes.hex} !== ${size}`)
  }
}

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
  const buff = data.map(e => Buff.bytes(e))
  return Buff.join([ htag, htag, Buff.join(buff) ]).digest
}
