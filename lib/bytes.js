export default class Bytes {

  static from(data, size, opt={}) {
    /** Create a byte-array from the presented data. */
    const { varint=false, reverse=false } = opt

    if (size && data === 0) {
      return new Uint8Array(size)
    }

    let bytes

    switch(typeof(data)) {
      case 'string':
        bytes = hexToBytes(data)
        break
      case 'number':
        bytes = numToBytes(data)
        break
      case 'bigint':
        bytes = bigIntToBytes(data)
        break
      default:
        throw new Error('Unknown data type:', typeof(data))
    }

    if (reverse) {
      // Reverse the byte-array.
      bytes.reverse()
    }
    if (!size) {
      // If no fixed-size is provided,
      // use length of byte-array.
      size = bytes.length
    }
    if (varint) {
      // If specified, prepend a varint that
      // provides the length of the byte-array.
      const varbytes = Bytes.varInt(size)
      bytes = [ ...varbytes, ...bytes ]
      size = bytes.length
    }

    // Return the byte-array as a
    // fixed-size uint8 typed array.
    const typedArray = new Uint8Array(size)
    typedArray.set(bytes, 0)
    return typedArray
  }

  static to(bytes, format, opt={}) {
    /** Convert a byte-array into the specified format. */
    const { reverse=false } = opt

    if (reverse) {
      // Reverse the byte-array.
      bytes.reverse()
    }

    switch(format) {
      case 'hex':
        return bytesToHex(bytes)
      case 'num':
        return bytesToNum(bytes)
      case 'bigInt':
        return bytesToBigInt(bytes)
    }
  }

  static join(arr) {
    let idx = 0
    let totalSize = arr.reduce((prev, curr) => prev + curr.length, 0)
    let totalBytes = new Uint8Array(totalSize)
    for (let bytes of arr) {
      for (let i = 0; i < bytes.length; idx++, i++) {
        totalBytes[idx] = bytes[i]
      }
    }
    return totalBytes
  }

  static varInt(num) {
    if (num < 0xfd) {
      return Bytes.from(num, 1)
    } else if (num < 0x10000) {
      return Bytes.join([Bytes.from('fd', 1), Bytes.from(num, 2)])
    } else if (num < 0x100000000) {
      return Bytes.join([Bytes.from('fe', 1), Bytes.from(num, 4)])
    } else if (num < 0x10000000000000000) {
      return Bytes.join([Bytes.from('ff', 1), Bytes.from(num, 8)])
    } else {
      throw new Error('Int value is too large:', num)
    }
  }
}

function hexToBytes(str) {
  const bytes = []
  if (str.length % 2) {
    throw new Error('Invalid hex string length:', str.length)
  }
  for (let i = 0, idx = 0; i < str.length; i += 2, idx++) {
    bytes[idx] = parseInt(str.substr(i, 2), 16)
  }
  return bytes
}

function numToBytes(num) {
  const bytes = []
  while (num > 0) {
  //for (let i = 0; i < bytes.length; i++) {
    let byte = num & 0xff
    bytes.push(byte)
    num = (num - byte) / 256
  }
  return bytes
}

function bigIntToBytes(bignum) {
  const bytes = []
  while (bignum > 0n) {
  //for (let i = 0; i < bytes.length; i++) {
    let byte = bignum & 0xffn
    bytes.push(Number(byte))
    bignum = (bignum - byte) / 256n
  }
  return bytes
}

function bytesToHex(bytes) {
  const hex = []
  for (let i = 0; i < bytes.length; i++) {
    hex.push(bytes[i].toString(16).padStart(2, '0'))
  }
  return hex.join('')
}

function bytesToNum(bytes) {
  let num = 0
  for (let i = bytes.length - 1; i >= 0; i--) {
    num = (num * 256) + bytes[i]
  }
  return num
}

function bytesToBigInt(bytes) {
  let num = 0n
  for (let i = bytes.length - 1; i >= 0; i--) {
    num = (num * 256n) + BigInt(bytes[i])
  }
  return num
}
