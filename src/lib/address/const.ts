import {
  AddressMeta,
  AddressType,
  Network
} from '../../schema/index.js'

import { decode_data } from './encoder.js'

export const ADDR_TYPES : AddressType[] = [
  [ 'p2pkh',   '1',      'main',    20, 'base58'  ],
  [ 'p2sh',    '3',      'main',    20, 'base58'  ],
  [ 'p2pkh',   'm',      'testnet', 20, 'base58'  ],
  [ 'p2pkh',   'n',      'testnet', 20, 'base58'  ],
  [ 'p2sh',    '2',      'testnet', 20, 'base58'  ],
  [ 'p2w-pkh', 'bc1q',   'main',    20, 'bech32'  ],
  [ 'p2w-pkh', 'tb1q',   'testnet', 20, 'bech32'  ],
  [ 'p2w-pkh', 'bcrt1q', 'regtest', 20, 'bech32'  ],
  [ 'p2w-sh',  'bc1q',   'main',    32, 'bech32'  ],
  [ 'p2w-sh',  'tb1q',   'testnet', 32, 'bech32'  ],
  [ 'p2w-sh',  'bcrt1q', 'regtest', 32, 'bech32'  ],
  [ 'p2tr',    'bc1p',   'main',    32, 'bech32m' ],
  [ 'p2tr',    'tb1p',   'testnet', 32, 'bech32m' ],
  [ 'p2tr',    'bcrt1p', 'regtest', 32, 'bech32m' ]
]

export const BECH32_PREFIXES : Record<Network, string> = {
  main    : 'bc',
  testnet : 'tb',
  signet  : 'tb',
  regtest : 'bcrt'
}

export function lookup (address : string) : AddressMeta | null {
  for (const row of ADDR_TYPES) {
    const [ type, prefix, network, size, format ] = row
    if (address.startsWith(prefix)) {
      const data = decode_data(address, format)
      if (data.length === size) {
        return { type, prefix, network, size, format }
      }
    }
  }
  return null
}
