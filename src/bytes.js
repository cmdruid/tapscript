import {
  strToBytes,
  hexToBytes,
  numToBytes,
  bigIntToBytes,
  bytesToStr,
  bytesToHex,
  bytesToNum,
  bytesToBigInt
} from './convert.js'

export class Bytes extends Uint8Array {
  constructor(data, size, opt = {}) {
    super(size)
    this.set(data)
    this.opt = opt
  }

  to(format, opt = {}) {
    return Bytes.to(this, format, opt)
  }

  prepend(data) {
    return Bytes.from([...data, ...this])
  }

  concat(data) {
    return Bytes.from([...this, ...data])
  }

  static convert(data, size, opt = {}) {
    /** Create a byte-array from the presented data. */
    const {
      varint = false,
      reverse = false,
      format = false
    } = opt

    if (size && data === 0) {
      return new Uint8Array(size)
    }

    let bytes

    switch (format || typeof (data)) {
      case 'str':
        bytes = strToBytes(data)
        break
      case 'hex':
        bytes = hexToBytes(data)
        break
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
        throw new Error(`Unsupported data type: ${typeof data}`)
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
      const varbyte = Bytes.varInt(size)
      bytes = [...varbyte, ...bytes]
      size = bytes.length
    }

    // Return the byte-array as a
    // fixed-size uint8 typed array.
    const typedArray = new Uint8Array(size)
    typedArray.set(bytes, 0)
    return typedArray
  }

  static from(bytes, format, opt = {}) {
    const raw = Bytes.convert(bytes, format, opt)
    return new Bytes(raw, raw.length, opt)
  }

  static to(bytes, format, opt = {}) {
    /** Convert a byte-array into the specified format. */
    const { reverse = false } = opt

    if (reverse) {
      // Reverse the byte-array.
      bytes.reverse()
    }

    switch (format) {
      case 'str':
        return bytesToStr(bytes)
      case 'hex':
        return bytesToHex(bytes)
      case 'number':
        return bytesToNum(bytes)
      case 'bigint':
        return bytesToBigInt(bytes)
      default:
        return Uint8Array.from(bytes)
    }
  }

  static join(arr) {
    let idx = 0
    const totalSize = arr.reduce((prev, curr) => prev + curr.length, 0)
    const totalBytes = new Uint8Array(totalSize)
    for (const bytes of arr) {
      for (let i = 0; i < bytes.length; idx++, i++) {
        totalBytes[idx] = bytes[i]
      }
    }
    return totalBytes
  }

  static varInt(num) {
    if (num < 0xfd) {
      return Bytes.convert(num, 1)
    } else if (num < 0x10000) {
      return Bytes.join([Bytes.convert('fd', 1), Bytes.convert(num, 2)])
    } else if (num < 0x100000000) {
      return Bytes.join([Bytes.convert('fe', 1), Bytes.convert(num, 4)])
    } else if (num < 0x10000000000000000) {
      return Bytes.join([Bytes.convert('ff', 1), Bytes.convert(num, 8)])
    } else {
      throw new Error(`Int value is too large: ${num}`)
    }
  }
}

export class Stream {
  constructor(data, size, opt = {}) {
    if (Array.isArray(data)) {
      data = Uint8Array.from(data)
    } else {
      data = Bytes.convert(data, size, opt)
    }

    if (!(data instanceof Uint8Array)) {
      throw new Error(`Unsupported type: ${typeof data}`)
    }

    this.data = data
    this.size = this.data.length
    this.buff = this.data.buffer
    this.name = this.data.name

    return this
  }

  peek(size, opt = {}) {
    const { reverse = false, format = 'bytes' } = opt

    if (size > this.length) {
      throw new Error(`Size greater than array: ${size} > ${this.length}`)
    }

    const bytes = (reverse)
      ? this.data.slice(0, size).reverse()
      : this.data.slice(0, size)

    switch (format) {
      case 'bytes':
        return bytes
      case 'str':
        return bytesToStr(bytes)
      case 'hex':
        return bytesToHex(bytes)
      case 'number':
        return bytesToNum(bytes)
      case 'bigint':
        return bytesToBigInt(bytes)
      default:
        throw new Error(`Unrecognized format: ${format}`)
    }
  }

  read(size, opt = {}) {
    size = size || this.readVarint()
    const data = this.peek(size, opt)
    this.data = this.data.slice(size)
    this.size -= size
    return data
  }

  readVarint() {
    const num = this.read(1, { format: 'number' })
    switch (true) {
      case (num >= 0 && num < 253):
        return num
      case (num === 253):
        return this.read(2, { format: 'number' })
      case (num === 254):
        return this.read(4, { format: 'number' })
      case (num === 255):
        return this.read(8, { format: 'number' })
      default:
        throw new Error(`Varint is out of range: ${num}`)
    }
  }
}
