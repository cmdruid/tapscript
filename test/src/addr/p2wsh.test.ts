
import { Test }    from 'tape'
import { Buff }    from '@cmdcode/buff-utils'
import { Address } from '../../../src/index.js'

export function p2wsh_test(t : Test) : void {

  const ref_preimg  = [ 1, 2, 'OP_ADD', 3, 'OP_EQUAL' ]
  const ref_address = 'bcrt1qetz4my584ckcqd0acdm7h788lkmslz44q5wc0rd3eknmmzc85sjq9sle8n'
  const ref_hexdata = '0020cac55d9287ae2d8035fdc377ebf8e7fdb70f8ab5051d878db1cda7bd8b07a424'
  const ref_hash    = 'cac55d9287ae2d8035fdc377ebf8e7fdb70f8ab5051d878db1cda7bd8b07a424'
  const ref_script  = [ 'OP_0', ref_hash, ]
  const ref_object  = { prefix: 'bcrt1q', type: 'p2w-sh', network: 'regtest', data: Buff.hex(ref_hash) , script: ref_script }

  t.test('P2WSH unit test', t => {
    t.plan(7)

    const addr1 = Address.p2wsh.fromScript(ref_preimg, 'regtest')
    t.equal(addr1, ref_address, 'Script should encode into proper address.')

    const addr2 = Address.p2wsh.encode(ref_hash, 'regtest')
    t.equal(addr2, ref_address, 'Hash should encode into proper address')

    const bytes = Address.p2wsh.decode(ref_address)
    t.equal(bytes.hex, ref_hash, 'Address should decode into proper hash.')

    const asm = Address.p2wsh.scriptPubKey(ref_hash)
    t.deepEqual(asm, ref_script, 'scriptPubKey should match reference script.')

    const data = Address.decode(ref_address)
    t.deepEqual(data, ref_object, 'Address should produce proper AddressData')

    const script = Address.toScriptPubKey(ref_address)
    t.deepEqual(script, ref_script, 'Address should produce proper scriptPubKey.')

    const addr3 = Address.fromScriptPubKey(ref_script, 'regtest')
    t.equal(addr3, ref_address, 'scriptPubKey should produce proper address.')
  })
}