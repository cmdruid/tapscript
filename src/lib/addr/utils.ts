
import { Buff }      from '@cmdcode/buff'
import { Script }    from '../script/index.js'
import { P2PKH }     from './p2pkh.js'
import { P2SH }      from './p2sh.js'
import { P2WPKH }    from './p2w-pkh.js'
import { P2WSH }     from './p2w-sh.js'
import { P2TR }      from './p2tr.js'
import { Tx }        from '../tx/index.js'

import { Networks, OutputType, ScriptData } from '../../schema/types.js'

import {
  AddressData,
  AddressTool,
  AddressType,
  AddrScriptTool
} from './schema.js'

export const ADDRESS_TYPES : AddressType[] = [
  [ '1',      'p2pkh',   'main',    20, 'base58'  ],
  [ '3',      'p2sh',    'main',    20, 'base58'  ],
  [ 'm',      'p2pkh',   'testnet', 20, 'base58'  ],
  [ 'n',      'p2pkh',   'testnet', 20, 'base58'  ],
  [ '2',      'p2sh',    'testnet', 20, 'base58'  ],
  [ 'bc1q',   'p2w-pkh', 'main',    20, 'bech32'  ],
  [ 'tb1q',   'p2w-pkh', 'testnet', 20, 'bech32'  ],
  [ 'bcrt1q', 'p2w-pkh', 'regtest', 20, 'bech32'  ],
  [ 'bc1q',   'p2w-sh',  'main',    32, 'bech32'  ],
  [ 'tb1q',   'p2w-sh',  'testnet', 32, 'bech32'  ],
  [ 'bcrt1q', 'p2w-sh',  'regtest', 32, 'bech32'  ],
  [ 'bc1p',   'p2tr',    'main',    32, 'bech32m' ],
  [ 'tb1p',   'p2tr',    'testnet', 32, 'bech32m' ],
  [ 'bcrt1p', 'p2tr',    'regtest', 32, 'bech32m' ]
]

function decodeFormat (address : string, format : string) : Buff {
  switch (format) {
    case 'base58'  : return Buff.b58chk(address).slice(1)
    case 'bech32'  : return Buff.bech32(address)
    case 'bech32m' : return Buff.bech32(address)
    default: throw new Error('Invalid address format: ' + format)
  }
}

function getData (address : string) : AddressType {
  for (const row of ADDRESS_TYPES) {
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
