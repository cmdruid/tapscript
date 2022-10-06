import { encodeTx, encodeScript, getSigHash } from './lib/encoder.js'
import { decodeTx } from './lib/decoder.js'
import { decodeScript, getScriptHash, getTemplateHash } from './lib/script.js'

export default class BTON {

  constructor(data, opt={}) {
    if (typeof(data) === 'string') {
      data = BTON.decode.tx(data, opt)
    } else {
      data = BTON.convert(data, opt)
    }

    this.data = data
    this.opt  = opt
    
    return this
  }

  static encode = {
    tx       : encodeTx,
    script   : encodeScript,
  }

  static decode = {
    tx       : decodeTx,
    script   : decodeScript
  }

  static convert = (tx, opt) => {
    return decodeTx(encodeTx(tx, opt), opt)
  }

  static digest = {
    sigHash      : getSigHash,
    scriptHash   : getScriptHash,
    templateHash : getTemplateHash,
    metahash     : null
  }

  static validate = {
    tx     : null,
    script : null
  }

  static crypto = {
    generate : null,
    sign     : null,
    sign     : null,
    verify   : null,
    hash256  : null,
    ripe160  : null
  }

  encode(opt) {
    return BTON.encode.tx(this.tx, opt)
  }

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
