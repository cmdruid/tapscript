import { encodeScript } from './encode.js'
import { decodeScript } from './decode.js'
import { FmtScript }    from './format.js'

export const Script = {
  encode : encodeScript,
  decode : decodeScript,
  fmt    : FmtScript
}
