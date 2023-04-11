import { Test }    from 'tape'
import { Buff }    from '@cmdcode/buff-utils'
import { secp256k1 as secp } from '@noble/curves/secp256k1'
import { Signer, TxData }    from '../../../../src/index.js'
import test_data  from './bip0143.vectors.json' assert { type: 'json' }

export async function sighash_vector_test(t :Test) : Promise<void> {
  t.test('Testing segwit sighash vectors.', async t => {
    const { redeemScript, txdata, sign_vectors } = test_data
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
        const hash = Signer.segwit.hash(txdata, index, config)
        t.equal(hash.hex, sigHash, 'Sighash should be equal.')
      } catch (err) {
        t.fail(err.message)
      }

      try {
        const txcopy = { ...txdata } as TxData
        const sig = Signer.segwit.sign(seckey, txcopy, index, config)
        t.equal(sig.hex, signature, 'Signatures should be equal.')
        const nobleVerify = secp.verify(sig.slice(0, -1).hex, sigHash, pubkey)
        t.equal(nobleVerify, true, 'Signature should be valid using Noble.')
        txcopy.vin[index].witness = [ sig, pubkey, redeemScript ]
        const signerVerify = Signer.segwit.verify(txcopy, index, config)
        t.equal(signerVerify, true, 'Signature should be valid using Signer.')
      } catch (err) {
        t.fail(err.message)
      }
    }
  })
}
