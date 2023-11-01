
import { Test } from 'tape'

import {
  create_addr,
  P2TR
} from '@cmdcode/tapscript/address'

export default function (t : Test) : void {

  const key  = '91b64d5324723a985170e4dc5a0f84c041804f2cd12660fa5dec09fc21783605'
  const addr = 'bcrt1pjxmy65eywgafs5tsunw95ruycpqcqnev6ynxp7jaasylcgtcxczsqzdc9v'
  const asm  = [ 'OP_1', key ]
  const hex  = `5120${key}`
  const ref  = { asm, hex, key, network: 'regtest', type: 'p2tr' }

  t.test('P2TR unit test', t => {
    t.plan(4)

    const addr1 = P2TR.create(key, 'regtest')
    t.equal(addr1, addr, 'Pubkey should encode into proper address.')

    const addr2 = P2TR.encode(key, 'regtest')
    t.equal(addr2, addr, 'Pubkey should encode into proper address')

    const data = P2TR.decode(addr)
    t.deepEqual(data, ref, 'Address should produce proper AddressData')

    const addr3 = create_addr(asm, 'regtest')
    t.equal(addr3, addr, 'scriptPubKey should produce proper address.')
  })
}