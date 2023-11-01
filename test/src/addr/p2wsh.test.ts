
import { Test } from 'tape'

import {
  create_addr,
  P2WSH
} from '@cmdcode/tapscript/address'

export default function p2wsh_test (t : Test) : void {

  const img  = [ 1, 2, 'OP_ADD', 3, 'OP_EQUAL' ]
  const addr = 'bcrt1qetz4my584ckcqd0acdm7h788lkmslz44q5wc0rd3eknmmzc85sjq9sle8n'
  const key  = 'cac55d9287ae2d8035fdc377ebf8e7fdb70f8ab5051d878db1cda7bd8b07a424'
  const asm  = [ 'OP_0', key, ]
  const hex  = `0020${key}`
  const ref  = { asm, hex, key, network: 'regtest', type: 'p2w-sh' }

  t.test('P2WSH unit test', t => {
    t.plan(4)

    const addr1 = P2WSH.create(img, 'regtest')
    t.equal(addr1, addr, 'Script should encode into proper address.')

    const addr2 = P2WSH.encode(key, 'regtest')
    t.equal(addr2, addr, 'Hash should encode into proper address')

    const data = P2WSH.decode(addr)
    t.deepEqual(data, ref, 'Address should produce proper AddressData')

    const addr3 = create_addr(asm, 'regtest')
    t.equal(addr3, addr, 'scriptPubKey should produce proper address.')
  })
}