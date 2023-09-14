
import { Test } from 'tape'
import { Buff } from '@cmdcode/buff'

import {
  create_addr,
  P2WSH
} from '@cmdcode/tapscript/address'

export default function p2wsh_test (t : Test) : void {

  const ref_preimg  = [ 1, 2, 'OP_ADD', 3, 'OP_EQUAL' ]
  const ref_address = 'bcrt1qetz4my584ckcqd0acdm7h788lkmslz44q5wc0rd3eknmmzc85sjq9sle8n'
  const ref_hash    = 'cac55d9287ae2d8035fdc377ebf8e7fdb70f8ab5051d878db1cda7bd8b07a424'
  const ref_script  = [ 'OP_0', ref_hash, ]
  const ref_object  = { type: 'p2w-sh', network: 'regtest', key: Buff.hex(ref_hash) , script: ref_script }

  t.test('P2WSH unit test', t => {
    t.plan(4)

    const addr1 = P2WSH.create(ref_preimg, 'regtest')
    t.equal(addr1, ref_address, 'Script should encode into proper address.')

    const addr2 = P2WSH.encode(ref_hash, 'regtest')
    t.equal(addr2, ref_address, 'Hash should encode into proper address')

    const data = P2WSH.decode(ref_address)
    t.deepEqual(data, ref_object, 'Address should produce proper AddressData')

    const addr3 = create_addr(ref_script, 'regtest')
    t.equal(addr3, ref_address, 'scriptPubKey should produce proper address.')
  })
}