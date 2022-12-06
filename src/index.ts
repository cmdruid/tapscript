import encodeTx  from './encode.js'
import decodeTx  from './decode.js'
import * as TX   from './class/Transaction/index.js'
import * as Type from './types.js'

const BTON = {
  encode: encodeTx,
  decode: decodeTx
}

export {
  BTON,
  TX,
  Type
}
