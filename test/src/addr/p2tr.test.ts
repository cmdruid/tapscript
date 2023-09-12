
import { Test } from 'tape'
import { Buff } from '@cmdcode/buff'

import { Address } from '../../../src/index.js'

export default function (t : Test) : void {

  const ref_pubkey  = '91b64d5324723a985170e4dc5a0f84c041804f2cd12660fa5dec09fc21783605'
  const ref_address = 'bcrt1pjxmy65eywgafs5tsunw95ruycpqcqnev6ynxp7jaasylcgtcxczsqzdc9v'
  const ref_hexdata = '512091b64d5324723a985170e4dc5a0f84c041804f2cd12660fa5dec09fc21783605'
  const ref_script  = [ 'OP_1', ref_pubkey ]
  const ref_object  = { type: 'p2tr', network: 'regtest', key: Buff.hex(ref_pubkey), script: ref_script }

  t.test('P2TR unit test', t => {
    t.plan(4)

    const addr1 = Address.P2TR.create(ref_pubkey, 'regtest')
    t.equal(addr1, ref_address, 'Pubkey should encode into proper address.')

    const addr2 = Address.P2TR.encode(ref_pubkey, 'regtest')
    t.equal(addr2, ref_address, 'Pubkey should encode into proper address')

    const data = Address.P2TR.decode(ref_address)
    t.deepEqual(data, ref_object, 'Address should produce proper AddressData')

    const addr3 = Address.from_script(ref_script, 'regtest')
    t.equal(addr3, ref_address, 'scriptPubKey should produce proper address.')
  })
}