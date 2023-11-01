
import { Test } from 'tape'

import {
  create_addr,
  P2PKH
} from '@cmdcode/tapscript/address'

export default function (t : Test) : void {

  const pubkey  = '037191e9be308354c79d9e0d596e74fce4a98768459a846a073799ad20b4c78770'
  const addr = 'msi862KMaLR3jHcdKtAh9QMN2sS8Qcyywy'
  const key  = '85be4269276fd45d0b6f7ee963dd073b202d49ed'
  const asm  = [ 'OP_DUP', 'OP_HASH160', key, 'OP_EQUALVERIFY', 'OP_CHECKSIG' ]
  const hex  = `76a914${key}88ac`
  const ref  = { asm, hex, key, network: 'testnet', type: 'p2pkh' }

  t.test('P2PKH unit test', t => {
    t.plan(4)

    const addr1 = P2PKH.create(pubkey, 'regtest')
    t.equal(addr1, addr, 'Pubkey should encode into proper address.')

    const addr2 = P2PKH.encode(key, 'regtest')
    t.equal(addr2, addr, 'Hash should encode into proper address')

    const data  = P2PKH.decode(addr)
    t.deepEqual(data, ref, 'Address should produce proper AddressData')

    const addr3 = create_addr(asm, 'regtest')
    t.equal(addr3, addr, 'script should produce proper address.')
  })
}
