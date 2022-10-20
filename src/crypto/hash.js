/* eslint-disable no-multi-spaces */
import { webcrypto as crypto } from 'crypto'
import { hash160 } from './ripemd160.js'
import Convert from '../format/convert.js'

const ec = new TextEncoder()

export default class Hash {
  static async sha256(bytes) {
    return Hash.digest(bytes)
  }

  static ripemd160(bytes) {
    return hash160(bytes)
  }

  static async hash160(bytes) {
    return Hash.sha256(bytes).then((b) => Hash.ripemd160(b))
  }

  static async hash256(bytes) {
    return Hash.digest(bytes, { rounds: 2 })
  }

  static async digest(bytes, opt) {
    const hash = new Hash(opt)

    hash.buff = (typeof bytes === 'string')
      ? ec.encode(bytes)
      : bytes

    for (let i = 1; i < hash.rnds; i++) {
      hash.buff = await crypto.subtle.digest(hash.algo, hash.buff)
    }
    return hash
  }

  constructor(opt = {}) {
    this.algo = opt.algo   || 'SHA-256'
    this.rnds = opt.rounds || 1
    this.buff = null
  }

  toHex() {
    return Convert.from(this.buff).toHex()
  }
}
