import { Bytes } from './bytes.js'
import { webcrypto } from 'crypto'

const crypto = (typeof window !== 'undefined')
  ? window.crypto
  : webcrypto

export async function sha256 (data, rounds = 1) {
  if (!(data instanceof Uint8Array)) {
    data = Bytes.from(data)
  }
  for (let i = 0; i < rounds; i++) {
    data = await crypto.subtle.digest('SHA-256', data)
  }
  return new Uint8Array(data)
}
