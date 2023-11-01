
import { Test } from 'tape'

import {
  create_addr,
  P2SH
} from '@cmdcode/tapscript/address'

export default function (t : Test) : void {

  const img  = '001494d325b4767d23020cec68a9ca75b8fe9264b7af'
  const addr = '2NFbT9Fkp7yjp22dvu7tHgikd8Yfy87KnTc'
  const key  = 'f52611446bdfa1f67da1fb7805dbee74c6d92a54'
  const asm  = [ 'OP_HASH160', key, 'OP_EQUAL' ]
  const hex  = `a914${key}87`
  const ref  = { asm, hex, key, network: 'testnet', type: 'p2sh' }

  t.test('P2SH unit test', t => {
    t.plan(4)

    const addr1 = P2SH.create(img, 'regtest')
    t.equal(addr1, addr, 'Script should encode into proper address.')

    const addr2 = P2SH.encode(key, 'regtest')
    t.equal(addr2, addr, 'Hash should encode into proper address')

    const data = P2SH.decode(addr)
    t.deepEqual(data, ref, 'Address should produce proper AddressData')

    const addr3 = create_addr(asm, 'regtest')
    t.equal(addr3, addr, 'scriptPubKey should produce proper address.')
  })
}