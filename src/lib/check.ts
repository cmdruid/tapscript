import { Bytes } from '@cmdcode/buff'

export function isHex<T> (value : T) : value is Extract<T, string> {
  return (
    typeof value === 'string' &&
    value.length % 2 === 0    &&
    /[0-9a-fA-F]/.test(value)
  )
}

export function isBytes<T> (value : T) : value is Extract<T, Bytes> {
  return (isHex(value) || value instanceof Uint8Array)
}

export function isValidAnnex (annex : any) : boolean {
  return (
    typeof annex === 'string' &&
    annex.startsWith('50')
  )
}
