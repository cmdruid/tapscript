import Convert from './format/convert.js'

export class Bytes extends Convert {
  constructor(data, size) {
    super(size).set(data)
    this.size = this.length
  }

  prepend(data) {
    return Bytes.from([...data, ...this])
  }

  concat(data) {
    return Bytes.from([...this, ...data])
  }

  static from(data, size, opt = {}) {
    /** Create a byte-array from the presented data. */
    if (size && data === 0) {
      return new Uint8Array(size)
    }

    let buffer = Convert.from(data, opt.format)

    if (opt.reverse) {
      // Reverse the byte-array.
      buffer.reverse()
    }

    if (!size) {
      // If no fixed-size is provided,
      // use length of byte-array.
      size = buffer.length
    }

    if (opt.varint) {
      // If specified, prepend a varint that
      // provides the length of the byte-array.
      const varbyte = Bytes.varInt(size)
      buffer = [...varbyte, ...buffer]
      size = buffer.length
    }

    // Return the byte-array as a
    // fixed-size uint8 typed array.
    return new Bytes(buffer, size)
  }

  to(format, size, opt = {}) {
    /** Convert a byte-array into the specified format. */
    if (opt.reverse) {
      // Reverse the byte-array.
      this.reverse()
    }
    return Convert.bytes(this).to(format, size)
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
    return new Bytes(totalBytes, totalSize)
  }

  static varInt(num) {
    if (num < 0xFD) {
      return Bytes.from(num, 1)
    } else if (num < 0x10000) {
      return Bytes.join([Bytes.from(0xFD, 1), Bytes.from(num, 2)])
    } else if (num < 0x100000000) {
      return Bytes.join([Bytes.from(0xFE, 1), Bytes.from(num, 4)])
    } else if (num < 0x10000000000000000) {
      return Bytes.join([Bytes.from(0xFF, 1), Bytes.from(num, 8)])
    } else {
      throw new Error(`Int value is too large: ${num}`)
    }
  }
}

export class Stream {
  constructor(data) {
    this.data = Bytes.from(data).toBytes()
    this.size = this.data.length
    return this
  }

  peek(size, reverse) {
    if (size > this.size) {
      throw new Error(`Size greater than stream: ${size} > ${this.size}`)
    }
    const chunk = (reverse)
      ? this.data.slice(0, size).reverse()
      : this.data.slice(0, size)
    return Bytes.from(chunk)
  }

  read(size, reverse) {
    size = size || this.readVarint()
    const chunk = this.peek(size, reverse)
    this.data = this.data.slice(size)
    this.size = this.data.length
    return chunk
  }

  readVarint() {
    const num = this.read(1).toNumber()
    switch (true) {
      case (num >= 0 && num < 0xFD):
        return num
      case (num === 0xFD):
        return this.read(2).toNumber()
      case (num === 0xFE):
        return this.read(4).toNumber()
      case (num === 0xFF):
        return this.read(8).toNumber()
      default:
        throw new Error(`Varint is out of range: ${num}`)
    }
  }
}
