import { Test } from 'tape'
import { Buff } from '@cmdcode/buff-utils'

import { secp256k1 as secp } from '@noble/curves/secp256k1'
import { SigHash, TxData }   from '../../../../src/index.js'
import { parse_tx }          from '../../../../src/lib/tx/parse.js'

import test_data from './bip0143.vectors.json' assert { type: 'json' }

export function sighash_vector_test(t :Test) {
  t.test('Testing segwit sighash vectors.', t => {
    const { segwit } = SigHash
    const { redeemScript, txdata, sign_vectors } = test_data

    const tx = parse_tx(txdata)

    t.plan(sign_vectors.length * 4)
    for (const vector of sign_vectors) {
      const { label, hashType, sigHash, } = vector
      const { pubkey, seckey, signature } = vector
      const sigflag = Buff.hex(hashType, 4).reverse().num
      const config  = { sigflag, pubkey, script: redeemScript, throws: true }
      const index   = 0

      t.comment(`Testing ${label}:`)

      // console.log('seckey:', seckey)
      // console.log('pubkey:', pubkey)
      // console.log('hash:', sigHash)
      // console.log('signature:', signature)
    
      try {
        const hash = segwit.hash_tx(tx, { txindex: index, ...config })
        t.equal(hash.hex, sigHash, 'Sighash should be equal.')
      } catch (err) {
        t.fail(err.message)
      }

      try {
        const txcopy = { ...tx } as TxData
        const sig = segwit.sign_tx(seckey, txcopy, { txindex: index, ...config })
        t.equal(sig.hex, signature, 'Signatures should be equal.')
        const nobleVerify = secp.verify(sig.slice(0, -1).hex, sigHash, pubkey)
        t.equal(nobleVerify, true, 'Signature should be valid using Noble.')
        txcopy.vin[index].witness = [ sig, pubkey, redeemScript ]
        const signerVerify = segwit.verify_tx(txcopy, { txindex: index, ...config })
        t.equal(signerVerify, true, 'Signature should be valid using Signer.')
      } catch (err) {
        t.fail(err.message)
      }
    }
  })
}
