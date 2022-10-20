import Convert from './format/convert.js'
import Base64 from './format/base64.js'

export function JSONtoBytes(json) {
  const encoded = Base64.encode(JSON.stringify(json))
  return Convert.string(encoded).toBytes()
}

export function bytesToJSON(bytes) {
  const string = Convert.bytes.toString(bytes)
  return JSON.parse(Base64.decode(string))
}

export function varintToBytes(num) {
  const bytes = Convert.number(num).toBytes
  if (num < 0xfd) {
    return bytes
  } else if (num < 0x10000) {
    return new Uint8Array(3).set([254, ...bytes])
  } else if (num < 0x100000000) {
    return new Uint8Array(5).set([254, ...bytes])
  } else if (num < 0x10000000000000000) {
    return new Uint8Array(9).set([254, ...bytes])
  } else {
    throw new Error('Int value is too large:', num)
  }
}
