import { encodeTx, encodeScript, getSigHash } from './lib/encoder.js'

export default class BTON {
  static encodeTx(tx, opt) {
    return encodeTx(tx, opt)
  }

  static decodeTx(hex, opt) {
    throw new Error('Interface not implemented.')
  }

  static encodeScript(script, opt) {
    return encodeScript(script, opt)
  }

  static decodeScript(hex, opt) {
    throw new Error('Interface not implemented.')
  }

  static sighash(tx, opt) {
    return getSigHash(tx, opt)
  }

  static validateTx(tx, opt) {
    throw new Error('Interface not implemented.')
  }

  static validateScript(script, opt) {
    throw new Error('Interface not implemented.')
  }

  static validateSighash(hex, opt) {
    throw new Error('Interface not implemented.')
  }
}
