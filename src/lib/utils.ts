import { Buff, Bytes } from '@cmdcode/buff-utils'

export function assert (value : unknown, message ?: string) : asserts value {
  if (value === false) throw new Error(message ?? 'Assertion failed')
}

export function check_size (input : Bytes, size : number) : void {
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

export function is_hex (
  input : any
) : input is string {
  const regex = /[^a-fA-f0-9]/
  if (
    typeof input === 'string' &&
    input.length % 2 === 0    &&
    input.match(regex) === null
  ) { return true }
  return false
}

export function is_bytes (input : any) : input is Bytes {
  if (
    typeof input === 'string' &&
    is_hex(input)
  ) {
    return true
  } else if (
    typeof input === 'number' ||
    typeof input === 'bigint' ||
    input instanceof Uint8Array
  ) {
    return true
  } else if (
    Array.isArray(input) &&
    input.every(e => typeof e === 'number')
  ) {
    return true
  } else  {
    return false
  }
}
