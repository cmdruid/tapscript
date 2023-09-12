
import { Test } from 'tape'
import { Buff } from '@cmdcode/buff'

import { Address } from '../../../src/index.js'

export default function (t : Test) : void {

  const ref_preimg  = '001494d325b4767d23020cec68a9ca75b8fe9264b7af'
  const ref_address = '2NFbT9Fkp7yjp22dvu7tHgikd8Yfy87KnTc'
  const ref_hexdata = 'a914f52611446bdfa1f67da1fb7805dbee74c6d92a5487'
  const ref_hash    = 'f52611446bdfa1f67da1fb7805dbee74c6d92a54'
  const ref_script  = [ 'OP_HASH160', ref_hash, 'OP_EQUAL' ]
  const ref_object  = { type: 'p2sh', network: 'testnet', key: Buff.hex(ref_hash) , script: ref_script }

  t.test('P2SH unit test', t => {
    t.plan(4)

    const addr1 = Address.P2SH.create(ref_preimg, 'regtest')
    t.equal(addr1, ref_address, 'Script should encode into proper address.')

    const addr2 = Address.P2SH.encode(ref_hash, 'regtest')
    t.equal(addr2, ref_address, 'Hash should encode into proper address')

    const data = Address.P2SH.decode(ref_address)
    t.deepEqual(data, ref_object, 'Address should produce proper AddressData')

    const addr3 = Address.from_script(ref_script, 'regtest')
    t.equal(addr3, ref_address, 'scriptPubKey should produce proper address.')
  })
}