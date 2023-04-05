
import { Test }    from 'tape'
import { Buff }    from '@cmdcode/buff-utils'
import { Address } from '../../../src/index.js'

export function p2w_test(t : Test) : void {

  const ref_pubkey  = '03d5af2a3e89cb72ff9ca1b36091ca46e4d4399abc5574b13d3e56bca6c0784679'
  const ref_address = 'bcrt1q738hdjlatdx9xmg3679kwq9cwd7fa2c84my9zk'
  const ref_hexdata = '0014f44f76cbfd5b4c536d11d78b6700b8737c9eab07'
  const ref_hash    = 'f44f76cbfd5b4c536d11d78b6700b8737c9eab07'
  const ref_script  = [ 'OP_0', ref_hash ]
  const ref_object  = { prefix: 'bcrt1q', type: 'p2w', network: 'regtest', data: Buff.hex(ref_hash), script: ref_script }

  t.test('P2W unit test', t => {
    t.plan(5)

    const address = Address.p2w.encode(ref_pubkey, 'regtest')
    t.equal(address, ref_address)

    const bytes = Address.p2w.decode(address)
    t.equal(bytes.hex, ref_hash)

    const asm = Address.p2w.script(bytes)
    t.deepEqual(asm, ref_script)

    const data = Address.decode(address)
    t.deepEqual(data, ref_object)

    const script = Address.toScript(address)
    t.equal(script.hex, ref_hexdata)
  })
}