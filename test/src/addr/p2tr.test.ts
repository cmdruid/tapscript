
import { Test }    from 'tape'
import { Buff }    from '@cmdcode/buff-utils'
import { Address } from '../../../src/index.js'

export function p2tr_test(t : Test) : void {

  const ref_pubkey  = '91b64d5324723a985170e4dc5a0f84c041804f2cd12660fa5dec09fc21783605'
  const ref_address = 'bcrt1pjxmy65eywgafs5tsunw95ruycpqcqnev6ynxp7jaasylcgtcxczsqzdc9v'
  const ref_hexdata = '512091b64d5324723a985170e4dc5a0f84c041804f2cd12660fa5dec09fc21783605'
  const ref_script  = [ 'OP_1', ref_pubkey ]
  const ref_object  = { prefix: 'bcrt1p', type: 'p2tr', network: 'regtest', data: Buff.hex(ref_pubkey), script: ref_script }

  t.test('P2TR unit test', t => {
    t.plan(7)

    const addr1 = Address.p2tr.fromPubKey(ref_pubkey, 'regtest')
    t.equal(addr1, ref_address, 'Pubkey should encode into proper address.')

    const addr2 = Address.p2tr.encode(ref_pubkey, 'regtest')
    t.equal(addr2, ref_address, 'Pubkey should encode into proper address')

    const bytes = Address.p2tr.decode(ref_address)
    t.equal(bytes.hex, ref_pubkey, 'Address should decode into proper pubkey.')

    const asm = Address.p2tr.scriptPubKey(ref_pubkey)
    t.deepEqual(asm, ref_script, 'scriptPubKey should match reference script.')

    const data = Address.decode(ref_address)
    t.deepEqual(data, ref_object, 'Address should produce proper AddressData')

    const script = Address.toScriptPubKey(ref_address)
    t.deepEqual(script, ref_script, 'Address should produce proper scriptPubKey.')

    const addr3 = Address.fromScriptPubKey(ref_script, 'regtest')
    t.equal(addr3, ref_address, 'scriptPubKey should produce proper address.')
  })
}