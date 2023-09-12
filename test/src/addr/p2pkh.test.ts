
import { Test } from 'tape'
import { Buff } from '@cmdcode/buff'

import { Address } from '../../../src/index.js'

export default function (t : Test) : void {

  // const ref_hexdata = '76a91485be4269276fd45d0b6f7ee963dd073b202d49ed88ac'
  const ref_pubkey  = '037191e9be308354c79d9e0d596e74fce4a98768459a846a073799ad20b4c78770'
  const ref_address = 'msi862KMaLR3jHcdKtAh9QMN2sS8Qcyywy'
  const ref_hash    = '85be4269276fd45d0b6f7ee963dd073b202d49ed'
  const ref_script  = [ 'OP_DUP', 'OP_HASH160', ref_hash, 'OP_EQUALVERIFY', 'OP_CHECKSIG' ]
  const ref_object  = { type: 'p2pkh', network: 'testnet', key: Buff.hex(ref_hash) , script: ref_script }

  t.test('P2PKH unit test', t => {
    t.plan(4)

    const addr1 = Address.P2PKH.create(ref_pubkey, 'regtest')
    t.equal(addr1, ref_address, 'Pubkey should encode into proper address.')

    const addr2 = Address.P2PKH.encode(ref_hash, 'regtest')
    t.equal(addr2, ref_address, 'Hash should encode into proper address')

    const data = Address.P2PKH.decode(ref_address)
    t.deepEqual(data, ref_object, 'Address should produce proper AddressData')

    const addr3 = Address.from_script(ref_script, 'regtest')
    t.equal(addr3, ref_address, 'script should produce proper address.')
  })
}
