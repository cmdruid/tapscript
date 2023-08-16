import * as encoder from './encode.js'
import * as decoder from './decode.js'
import * as format  from './format.js'
import * as parser  from './parse.js'
import * as word    from './words.js'

const { encode_word, encode_words } = encoder
const { decode_words }     = decoder
const { to_bytes, to_asm } = format
const { parse_scriptkey }  = parser

const encode = encoder.encode_script
const decode = decoder.decode_script
const words  = { decode_words, encode_words, encode_word, ...word }

export {
  encode,
  decode,
  parse_scriptkey,
  to_asm,
  to_bytes,
  words
}
