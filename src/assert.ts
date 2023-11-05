import { Buff, Bytes } from '@cmdcode/buff'

export function ok (value : unknown, message ?: string) : asserts value {
  if (value === false) throw new Error(message ?? 'Assertion failed!')
}

export function size (input : Bytes, size : number) : void {
  const bytes = Buff.bytes(input)
  if (bytes.length !== size) {
    throw new Error(`Invalid input size: ${bytes.hex} !== ${size}`)
  }
}
