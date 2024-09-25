
import { Test }    from 'tape'
import { Buff }    from '@cmdcode/buff'
import { Address } from '../../../src/index.js'

export function p2pkh_test(t : Test) : void {

  const ref_pubkey  = '037191e9be308354c79d9e0d596e74fce4a98768459a846a073799ad20b4c78770'
  const ref_address = 'msi862KMaLR3jHcdKtAh9QMN2sS8Qcyywy'
  const ref_hexdata = '76a91485be4269276fd45d0b6f7ee963dd073b202d49ed88ac'
  const ref_hash    = '85be4269276fd45d0b6f7ee963dd073b202d49ed'
  const ref_script  = [ 'OP_DUP', 'OP_HASH160', ref_hash, 'OP_EQUALVERIFY', 'OP_CHECKSIG' ]
  const ref_object  = { prefix: 'm', type: 'p2pkh', network: 'testnet', data: Buff.hex(ref_hash) , script: ref_script }

  t.test('P2PKH unit test', t => {
    t.plan(7)

    const addr1 = Address.p2pkh.fromPubKey(ref_pubkey, 'regtest')
    t.equal(addr1, ref_address, 'Pubkey should encode into proper address.')

    const addr2 = Address.p2pkh.encode(ref_hash, 'regtest')
    t.equal(addr2, ref_address, 'Hash should encode into proper address')

    const bytes = Address.p2pkh.decode(ref_address, 'regtest')
    t.equal(bytes.hex, ref_hash, 'Address should decode into proper hash.')

    const asm = Address.p2pkh.scriptPubKey(ref_hash)
    t.deepEqual(asm, ref_script, 'scriptPubKey should match reference script.')

    const data = Address.decode(ref_address)
    t.deepEqual(data, ref_object, 'Address should produce proper AddressData')

    const script = Address.toScriptPubKey(ref_address)
    t.deepEqual(script, ref_script, 'Address should produce proper scriptPubKey.')

    const addr3 = Address.fromScriptPubKey(ref_script, 'regtest')
    t.equal(addr3, ref_address, 'scriptPubKey should produce proper address.')
  })
}