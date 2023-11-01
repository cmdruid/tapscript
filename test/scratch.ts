// import { Buff } from '@cmdcode/buff'

import { Buff } from "@cmdcode/buff";
import { parse_witness } from "@cmdcode/tapscript/tx";

// import {
//   P2TR,
//   parse_addr
// } from '@cmdcode/tapscript/address'

// const pubkey = Buff.random(32).hex

// const address = P2TR.encode(pubkey, 'regtest')
// const data    = parse_addr(address)

// console.log(data)

// console.log('pubkey:', pubkey)
// console.log('tapkey:', data.key)

const script = [
  'OP_RIPEMD160',
  'OP_SWAP',
  'OP_IF',
  'c4d4b6ee37ce0a16f0ed1655d71a4e0c540ff396',
  'OP_ELSE',
  '1a5bb08d91b6892c42e2006edc316a1211ad667a',
  'OP_ENDIF',
  'OP_EQUALVERIFY',
  2,
  Buff.random(32).hex,
  Buff.random(32).hex,
  2,
  'OP_CHECKMULTISIG'
]

const witness = [
  0, 
  '3045022100bdd0d4e107256aa7c66ccd8c05c3cab138e2079c558ae331d5abf76a1d65a12102207c41668e95c076730297d57a13d07fb3ec5ebe4033c08231fd00bc5d8ddde3be01',
  '3045022100ed21a4a7a9eb971c464364b33d1fd81c84fc7dde79e2f8e22222929b0e13342a02200ab1c27c2d292ad74a17fa3c6025ac1dc9d2b5f36e361439842b7dfabb91f0c801',
  1,
  'bf7db355933c2a0dabcf758b4d78d56e',
  script
]


const result = parse_witness(witness)

const is_hex = Buff.is_hex('OP_1')

console.log(is_hex)

console.log('params:', result.params.map(e => e.hex))
console.log('script:', result.script?.hex)
