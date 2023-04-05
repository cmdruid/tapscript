
import { Test }    from 'tape'
import { Buff }    from '@cmdcode/buff-utils'
import { Address } from '../../../src/index.js'

export function p2sh_test(t : Test) : void {

  const ref_preimg  = '001494d325b4767d23020cec68a9ca75b8fe9264b7af'
  const ref_address = '2NFbT9Fkp7yjp22dvu7tHgikd8Yfy87KnTc'
  const ref_hexdata = 'a914f52611446bdfa1f67da1fb7805dbee74c6d92a5487'
  const ref_hash    = 'f52611446bdfa1f67da1fb7805dbee74c6d92a54'
  const ref_script  = [ 'OP_HASH160', ref_hash, 'OP_EQUAL' ]
  const ref_object  = { prefix: '2', type: 'p2sh', network: 'testnet', data: Buff.hex(ref_hash) , script: ref_script }

  t.test('P2SH unit test', t => {
    t.plan(5)

    const address = Address.p2sh.encode(ref_preimg, 'regtest')
    t.equal(address, ref_address)

    const bytes = Address.p2sh.decode(address, 'regtest')
    t.equal(bytes.hex, ref_hash)

    const asm = Address.p2sh.script(bytes)
    t.deepEqual(asm, ref_script)

    const data = Address.decode(address)
    t.deepEqual(data, ref_object)

    const script = Address.toScript(address)
    t.equal(script.hex, ref_hexdata)
  })
}