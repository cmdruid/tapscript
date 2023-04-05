
import { Test }    from 'tape'
import { Buff }    from '@cmdcode/buff-utils'
import { Address } from '../../../src/index.js'

export function p2pkh_test(t : Test) : void {

  const ref_pubkey  = '037191e9be308354c79d9e0d596e74fce4a98768459a846a073799ad20b4c78770'
  const ref_address = 'msi862KMaLR3jHcdKtAh9QMN2sS8Qcyywy'
  const ref_hexdata = '76a91485be4269276fd45d0b6f7ee963dd073b202d49ed88ac'
  const ref_hash    = '85be4269276fd45d0b6f7ee963dd073b202d49ed'
  const ref_script  = [ 'OP_DUP', 'OP_HASH160', ref_hash, 'OP_EQUALVERIFY', 'OP_CHECKSIG' ]
  const ref_object  = { prefix: 'm', type: 'p2pkh', network: 'testnet', data: Buff.hex(ref_hash) , script: ref_script }

  t.test('P2PKH unit test', t => {
    t.plan(5)

    const address = Address.p2pkh.encode(ref_pubkey, 'regtest')
    t.equal(address, ref_address)

    const bytes = Address.p2pkh.decode(address, 'regtest')
    t.equal(bytes.hex, ref_hash)

    const asm = Address.p2pkh.script(bytes)
    t.deepEqual(asm, ref_script)

    const data = Address.decode(address)
    t.deepEqual(data, ref_object)

    const script = Address.toScript(address)
    t.equal(script.hex, ref_hexdata)
  })
}