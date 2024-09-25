import { encodeScript } from './lib/encode.js'
import { decodeScript } from './lib/decode.js'
import { FmtScript }    from './lib/format.js'

export const Script = {
  encode : encodeScript,
  decode : decodeScript,
  fmt    : FmtScript
}
