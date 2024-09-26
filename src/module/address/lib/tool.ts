
import { Buff }      from '@cmdcode/buff'
import { Script }    from '@/module/script/index.js'
import { Tx }        from '@/module/tx/index.js'
import { P2PKH }     from './p2pkh.js'
import { P2SH }      from './p2sh.js'
import { P2WPKH }    from './p2w-pkh.js'
import { P2WSH }     from './p2w-sh.js'
import { P2TR }      from './p2tr.js'


import type {
  Networks,
  OutputType,
  ScriptData
} from '@/types/index.js'

import type {
  AddressData,
  AddressTool,
  AddressType,
  AddrScriptTool
} from '../types.js'

import CONST from '../const.js'

function decodeFormat (address : string, format : string) : Buff {
  switch (format) {
    case 'base58'  : return Buff.b58chk(address).slice(1)
    case 'bech32'  : return Buff.bech32(address)
    case 'bech32m' : return Buff.bech32(address)
    default: throw new Error('Invalid address format: ' + format)
  }
}

function getData (address : string) : AddressType {
  for (const row of CONST.ADDRESS_TYPES) {
    const [ prefix, _type, _network, size, format ] = row
    if (
      address.startsWith(prefix)
    ) {
      const bytes = decodeFormat(address, format)
      if (bytes.length === size) return row
    }
  }
  throw new Error('Invalid address: ' + address)
}

function getTool (type : OutputType) : AddressTool | AddrScriptTool {
  switch (type) {
    case 'p2pkh'   : return P2PKH
    case 'p2sh'    : return P2SH
    case 'p2w-pkh' : return P2WPKH
    case 'p2w-sh'  : return P2WSH
    case 'p2tr'    : return P2TR
    default        : throw new Error('Invalid address type: ' + type)
  }
}

export function decodeAddress (
  address : string
) : AddressData {
  const [ prefix, type, network ] = getData(address)
  const tool   = getTool(type)
  const data   = tool.decode(address, network)
  const script = tool.scriptPubKey(data)
  return { prefix, type, network, data, script }
}

export function fromScriptPubKey (
  script   : ScriptData,
  network ?: Networks
) : string {
  const { type, data } = Tx.util.readScriptPubKey(script)
  const tool = getTool(type)
  return tool.encode(data, network)
}

export function toScriptPubKey (address : string) : ScriptData {
  const { script } = decodeAddress(address)
  return Script.fmt.toAsm(script, false)
}
