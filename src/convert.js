export function b64encode(str) {
  if (typeof window !== 'undefined') {
    return btoa(str)
  }
  return Buffer.from(str).toString('base64')
}

export function b64decode(str) {
  if (typeof window !== 'undefined') {
    return atob(str)
  }
  return Buffer.from(str, 'base64').toString('utf8')
}

export function strToBytes(str) {
  const bytes = []
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i)
  }
  return Uint8Array.from(bytes)
}

export function hexToBytes(str) {
  const bytes = []
  if (str.length % 2) {
    throw new Error('Invalid hex string length:', str.length)
  }
  for (let i = 0, idx = 0; i < str.length; i += 2, idx++) {
    bytes[idx] = parseInt(str.substr(i, 2), 16)
  }
  return bytes
}

export function numToBytes(num) {
  const bytes = []
  while (num > 0) {
  // for (let i = 0; i < bytes.length; i++) {
    const byte = num & 0xff
    bytes.push(byte)
    num = (num - byte) / 256
  }
  return bytes
}

export function bigIntToBytes(bignum) {
  const bytes = []
  while (bignum > 0n) {
  // for (let i = 0; i < bytes.length; i++) {
    const byte = bignum & 0xffn
    bytes.push(Number(byte))
    bignum = (bignum - byte) / 256n
  }
  return bytes
}

export function bytesToHex(bytes) {
  const hex = []
  for (let i = 0; i < bytes.length; i++) {
    hex.push(bytes[i].toString(16).padStart(2, '0'))
  }
  return hex.join('')
}

export function bytesToNum(bytes) {
  let num = 0
  for (let i = bytes.length - 1; i >= 0; i--) {
    num = (num * 256) + bytes[i]
  }
  return num
}

export function bytesToBigInt(bytes) {
  let num = 0n
  for (let i = bytes.length - 1; i >= 0; i--) {
    num = (num * 256n) + BigInt(bytes[i])
  }
  return num
}

export function bytesToStr(bytes) {
  const chars = []
  for (let i = 0; i < bytes.length; i++) {
    chars.push(String.fromCharCode(bytes[i]))
  }
  return chars.join('')
}

export function JSONtoBytes(json) {
  return strToBytes(b64encode(JSON.stringify(json)))
}

export function bytesToJSON(bytes) {
  return JSON.parse(b64decode(bytesToStr(bytes)))
}

export function varintToBytes(num) {
  const bytes = numToBytes(num)
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
