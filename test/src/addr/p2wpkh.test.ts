
import { Test } from 'tape'
import { Buff } from '@cmdcode/buff-utils'

import { Address } from '../../../src/index.js'

export default function (t : Test) : void {

  const ref_pubkey  = '03d5af2a3e89cb72ff9ca1b36091ca46e4d4399abc5574b13d3e56bca6c0784679'
  const ref_address = 'bcrt1q738hdjlatdx9xmg3679kwq9cwd7fa2c84my9zk'
  const ref_hexdata = '0014f44f76cbfd5b4c536d11d78b6700b8737c9eab07'
  const ref_hash    = 'f44f76cbfd5b4c536d11d78b6700b8737c9eab07'
  const ref_script  = [ 'OP_0', ref_hash ]
  const ref_object  = { type: 'p2w-pkh', network: 'regtest', data: Buff.hex(ref_hash), script: ref_script }

  t.test('P2WPKH unit test', t => {
    t.plan(4)

    const addr1 = Address.P2WPKH.create(ref_pubkey, 'regtest')
    t.equal(addr1, ref_address, 'Pubkey should encode into proper address.')

    const addr2 = Address.P2WPKH.encode(ref_hash, 'regtest')
    t.equal(addr2, ref_address, 'Hash should encode into proper address')

    const data = Address.P2WPKH.decode(ref_address)
    t.deepEqual(data, ref_object, 'Address should produce proper AddressData')

    const addr3 = Address.from_script(ref_script, 'regtest')
    t.equal(addr3, ref_address, 'scriptPubKey should produce proper address.')
  })
}
