
import { Buff }   from '@cmdcode/buff-utils'
import { Script } from '../script/index.js'
import { P2PKH }  from './p2pkh.js'
import { P2SH }   from './p2sh.js'
import { P2W }    from './p2w.js'
import { P2TR }   from './p2tr.js'

import { AddressData, AddressType } from './schema.js'

export const ADDRESS_TYPES : AddressType[] = [
  [ '1',      'p2pkh', 'main',    P2PKH ],
  [ '3',      'p2sh',  'main',    P2SH  ],
  [ 'm',      'p2pkh', 'testnet', P2PKH ],
  [ 'n',      'p2pkh', 'testnet', P2PKH ],
  [ '2',      'p2sh',  'testnet', P2SH  ],
  [ 'bc1q',   'p2w',   'main',    P2W   ],
  [ 'tb1q',   'p2w',   'testnet', P2W   ],
  [ 'bcrt1q', 'p2w',   'regtest', P2W   ],
  [ 'bc1p',   'p2tr',  'main',    P2TR  ],
  [ 'tb1p',   'p2tr',  'testnet', P2TR  ],
  [ 'bcrt1p', 'p2tr',  'regtest', P2TR  ]
]

export function decodeAddress (
  address : string
) : AddressData {
  for (const row of ADDRESS_TYPES) {
    if (address.startsWith(row[0])) {
      const [ prefix, type, network, tool ] = row
      const data   = tool.decode(address, network)
      const script = tool.script(data)
      return { prefix, type, network, data, script }
    }
  }
  throw new Error('Unable to detect address type!')
}

export function convertAddress (address : string) : Buff {
  const { script } = decodeAddress(address)
  return Script.encode(script, false)
}
