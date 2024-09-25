import type { Networks }    from '@/types/index.js'
import type { AddressType } from './types.js'

const ADDRESS_TYPES : AddressType[] = [
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

const BECH32_PREFIXES : Record<Networks, string> = {
  main    : 'bc',
  testnet : 'tb',
  signet  : 'tb',
  regtest : 'bcrt'
}

export default {
  ADDRESS_TYPES,
  BECH32_PREFIXES
}
