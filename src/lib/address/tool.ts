import { P2PKH }  from './p2pkh.js'
import { P2SH }   from './p2sh.js'
import { P2WPKH } from './p2wpkh.js'
import { P2WSH }  from './p2wsh.js'
import { P2TR }   from './p2tr.js'

import {
  AddressTool,
  ScriptEnum
} from '../../schema/index.js'

export const ADDR_TOOLS : Record<ScriptEnum, AddressTool> = {
  p2pkh     : P2PKH,
  p2sh      : P2SH,
  'p2w-pkh' : P2WPKH,
  'p2w-sh'  : P2WSH,
  p2tr      : P2TR
}