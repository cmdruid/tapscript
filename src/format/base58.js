export default class Base58 {
  static encode = toBase58
  static decode = fromBase58
  static ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
}

const ec = new TextEncoder()
const dc = new TextDecoder()

function toBase58(data) {
  const bytes = (data instanceof Uint8Array)
    ? data
    : ec.encode(data)

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
    s += Base58.ALPHABET[d[j]]
  }

  return s
}

function fromBase58(str) {
  const d = []; const b = []; let i; let j; let c; let n

  for (i in str) {
    j = 0
    c = Base58.ALPHABET.indexOf(str[i])

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

  return dc.decode(Uint8Array.from(b).buffer)
};

const testMessage = 'thisisatest'
const encoded = Base58.encode(testMessage)
const decoded = Base58.decode(encoded)

console.log(encoded, decoded, decoded === testMessage)
