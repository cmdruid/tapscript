/* eslint-disable quote-props */

import { Buff, Bytes } from '@cmdcode/buff-utils'
import { Networks }    from '../../schema/types.js'

export type KeyType = [
  type    : keyof AddressTools,
  network : Networks
]

export interface AddressTool {
  check  : (address : string, network ?: Networks) => boolean
  encode : (key     : Bytes,  network ?: Networks) => string
  decode : (address : string, network ?: Networks) => Buff
  script : (hash    : string) => string[]
}

export interface AddressTools {
  p2pkh : AddressTool
  p2sh  : AddressTool
  p2w   : AddressTool
  p2tr  : AddressTool
}

export const VALID_PREFIXES : Record<string, KeyType> = {
  '1'      : [ 'p2pkh', 'main'     ],
  '3'      : [ 'p2sh',  'main'     ],
  'm'      : [ 'p2pkh', 'testnet'  ],
  'n'      : [ 'p2pkh', 'testnet'  ],
  '2'      : [ 'p2sh',  'testnet'  ],
  'bc1q'   : [ 'p2w',   'main'     ],
  'tb1q'   : [ 'p2w',   'testnet'  ],
  'bcrt1q' : [ 'p2w',   'regtest'  ],
  'bc1p'   : [ 'p2tr',  'main'     ],
  'tb1p'   : [ 'p2tr',  'testnet'  ],
  'bcrt1p' : [ 'p2tr',  'regtest'  ]
}

export const BECH32_PREFIXES : Record<Networks, string> = {
  main    : 'bc',
  testnet : 'tb',
  signet  : 'tb',
  regtest : 'bcrt'
}
