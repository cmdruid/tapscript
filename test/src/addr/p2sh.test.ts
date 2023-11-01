
import { Test } from 'tape'

import {
  create_addr,
  P2SH
} from '@cmdcode/tapscript/address'

export default function (t : Test) : void {

  const ref_preimg  = '001494d325b4767d23020cec68a9ca75b8fe9264b7af'
  const ref_address = '2NFbT9Fkp7yjp22dvu7tHgikd8Yfy87KnTc'
  const ref_hash    = 'f52611446bdfa1f67da1fb7805dbee74c6d92a54'
  const ref_script  = [ 'OP_HASH160', ref_hash, 'OP_EQUAL' ]
  const ref_object  = { type: 'p2sh', network: 'testnet', key: ref_hash , asm: ref_script }

  t.test('P2SH unit test', t => {
    t.plan(4)

    const addr1 = P2SH.create(ref_preimg, 'regtest')
    t.equal(addr1, ref_address, 'Script should encode into proper address.')

    const addr2 = P2SH.encode(ref_hash, 'regtest')
    t.equal(addr2, ref_address, 'Hash should encode into proper address')

    const data = P2SH.decode(ref_address)
    t.deepEqual(data, ref_object, 'Address should produce proper AddressData')

    const addr3 = create_addr(ref_script, 'regtest')
    t.equal(addr3, ref_address, 'scriptPubKey should produce proper address.')
  })
}