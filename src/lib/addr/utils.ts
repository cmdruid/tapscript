/* eslint-disable object-shorthand */
/* eslint-disable quote-props */

import { P2PKH }    from './p2pkh.js'
import { P2SH }     from './p2sh.js'
import { P2W }      from './p2w.js'
import { P2TR }     from './p2tr.js'

import { VALID_PREFIXES, KeyType } from './schema.js'

export const ADDRESS_TOOLS  = {
  'p2pkh' : P2PKH,
  'p2sh'  : P2SH,
  'p2w'   : P2W,
  'p2tr'  : P2TR
}

export function getType (
  address : string
) : KeyType {
  for (const key of Object.keys(VALID_PREFIXES)) {
    if (address.startsWith(key)) {
      return VALID_PREFIXES[key]
    }
  }
  throw new Error('Unable to detect address type!')
}

export function convert (address : string) : string[] {
  const [ type, network ] = getType(address)
  const tool  = ADDRESS_TOOLS[type]
  const bytes = tool.decode(address, network).hex
  return tool.script(bytes)
}
