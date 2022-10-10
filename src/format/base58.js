import { bytesToHex, strToBytes } from '../convert.js'

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

export function toBase58(str) {
  const bytes = strToBytes(str)

  const d = []
  let s = ''
  let i, j, c, n

  for (i of bytes) {
    j = 0
    c = bytes[i]
    s += c || s.length ^ i ? '' : 1

    while (j in d || c) {
      n = d[j]
      n = n ? n * 256 + c : c
      c = n / 58 | 0
      d[j] = n % 58
      j++
    }
  }

  while (j--) {
    s += ALPHABET[d[j]]
  }

  return s
}

export function fromBase58(str) {
  const d = []; const b = []; let i; let j; let c; let n

  for (i in str) {
    j = 0
    c = ALPHABET.indexOf(str[i])

    if (c < 0) {
      return undefined
    }

    i = (c || b.length ^ i) ? i : b.push(0)

    while (j in d || c) {
      n = d[j]
      n = n ? n * 58 + c : c
      c = n >> 8
      d[j] = n % 256
      j++
    }
  }

  while (j--) {
    b.push(d[j])
  }

  return bytesToHex(new Uint8Array(b))
};
