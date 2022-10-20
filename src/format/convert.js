/* eslint-disable key-spacing */
/* eslint-disable no-multi-spaces */

import Type from './types.js'

export default class Convert extends Uint8Array {
  constructor(data) {
    super(data)
    return this
  }

  static string = x => new Convert(strToBytes(x))
  static hex    = x => new Convert(hexToBytes(x))
  static number = x => new Convert(numToBytes(x))
  static bigInt = x => new Convert(bigIntToBytes(x))
  static bytes  = x => new Convert(x)

  static from(data, format) {
    format = format || Type.of(data)

    switch (format) {
      case 'uint8':
        return new Convert(data)
      case 'uint16':
        return new Convert(data)
      case 'uint32':
        return new Convert(data)
      case 'hex':
        return Convert.hex(data)
      case 'str':
        return Convert.string(data)
      case 'string':
        return Convert.string(data)
      case 'number':
        return Convert.number(data)
      case 'bigint':
        return Convert.bigint(data)
      default:
        throw new Error('Unsupported format: ' + format)
    }
  }

  to(format) {
    switch (format) {
      case 'hex':
        return this.toHex()
      case 'str':
        return this.toString()
      case 'string':
        return this.toString()
      case 'number':
        return this.toNumber()
      case 'bigint':
        return this.toBigInt()
      case 'bytes':
        return new Uint8Array(this)
      default:
        throw new Error('Unsupported format: ' + format)
    }
  }

  toBytes = () => new Uint8Array(this)
  toArray  = () => Array.from(this)
  toString = () => bytesToStr(this)
  toNumber = () => bytesToNum(this)
  toBigInt = () => bytesToBigInt(this)
  toHex    = () => bytesToHex(this)
}

function strToBytes(str) {
  const ec = new TextEncoder()
  return ec.encode(str).buffer
}

function hexToBytes(str) {
  const bytes = []
  if (str.length % 2) {
    throw new Error('Invalid hex string length:', str.length)
  }
  for (let i = 0, idx = 0; i < str.length; i += 2, idx++) {
    bytes[idx] = parseInt(str.substr(i, 2), 16)
  }
  return Uint8Array.from(bytes).buffer
}

function numToBytes(num) {
  const bytes = []
  while (num > 0) {
    const byte = num & 0xff
    bytes.push(byte)
    num = (num - byte) / 256
  }
  return Uint8Array.from(bytes).buffer
}

function bigIntToBytes(bignum) {
  const bytes = []
  while (bignum > 0n) {
    const byte = bignum & 0xffn
    bytes.push(Number(byte))
    bignum = (bignum - byte) / 256n
  }
  return Uint8Array.from(bytes).buffer
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
  return Number(num)
}

function bytesToBigInt(bytes) {
  let num = 0n
  for (let i = bytes.length - 1; i >= 0; i--) {
    num = (num * 256n) + BigInt(bytes[i])
  }
  return BigInt(num)
}

function bytesToStr(bytes) {
  const dc = new TextDecoder()
  return dc.decode(bytes)
}
