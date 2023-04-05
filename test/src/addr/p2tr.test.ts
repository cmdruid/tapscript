
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
    t.plan(5)

    const address = Address.p2tr.encode(ref_pubkey, 'regtest')
    t.equal(address, ref_address)

    const bytes = Address.p2tr.decode(address)
    t.equal(bytes.hex, ref_pubkey)

    const asm = Address.p2tr.script(bytes)
    t.deepEqual(asm, ref_script)

    const data = Address.decode(address)
    t.deepEqual(data, ref_object)

    const script = Address.toScript(address)
    t.equal(script.hex, ref_hexdata)
  })
}