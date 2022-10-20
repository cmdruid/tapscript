import { encodeTx, encodeScript, getSigHash } from './src/encoder.js'
import { decodeTx } from './src/decoder.js'
import { decodeScript, getScriptHash, getTemplateHash } from './src/script.js'
import { Bytes, Stream } from './src/bytes.js'
import Base64 from './src/format/base64.js'
import Base58 from './src/format/base58.js'
import Bech32 from './src/format/bech32.js'
import Hash from './src/crypto/hash.js'

export default class BTON {
  static encode = {
    tx: encodeTx,
    script: encodeScript
  }

  static decode = {
    tx: decodeTx,
    script: decodeScript
  }

  static transcode = (tx, opt) => {
    return decodeTx(encodeTx(tx, opt), opt)
  }

  static digest = {
    sigHash: getSigHash,
    scriptHash: getScriptHash,
    templateHash: getTemplateHash,
    metahash: null
  }

  static utils = {
    bytes: Bytes,
    stream: Stream,
    bech32: Bech32,
    base58: Base58,
    base64: Base64,
    hash: Hash
  }

  static crypto = {
    secret: { encrypt: null, decrypt: null },
    ECDSA: { sign: null, verify: null },
    schnorr: { sign: null, verify: null }
  }

  // static validate = {
  //   tx: null,
  //   script: null
  // }

  // static crypto = {
  //   generate: null,
  //   sign: null,
  //   verify: null,
  //   hash256: null,
  //   ripe160: null
  // }

  // encode (opt) {
  //   return BTON.encode.tx(this.tx, opt)
  // }

  // static validate = {
  //   tx      : validateTx,
  //   script  : validateScript,
  //   sighash : validateSighash,
  //   address : validateAddress
  // }

  // static calc = {
  //   sighash: getSigHash,
  //   txid,
  //   address,
  //   size,
  //   weight,
  //   vsize
  // }
}
