import { Bytes } from '@cmdcode/buff-utils'

export function fail (
  message : string,
  throws  = false
) : boolean {
  if (!throws) return false
  throw new Error(message)
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

export function is_empty (data : any) : boolean {
  if (typeof data === 'undefined' || data === null) {
    return true
  } else if (
    Array.isArray(data)      ||
    typeof data === 'string' ||
    data instanceof Uint8Array
  ) {
    return data.length === 0
  } else if (typeof data === 'object') {
    return Object.keys(data).length === 0
  }
  return false
}
