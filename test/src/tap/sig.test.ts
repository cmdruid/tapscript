import { Test }  from 'tape'
import { Buff }  from '@cmdcode/buff-utils'
import { Noble } from '@cmdcode/crypto-utils'

import { decodeTx } from '../../../src/lib/tx/decode.js'
import * as SIG     from '../../../src/lib/sig/taproot.js'
import test_vectors from './sig.vectors.json' assert { type: 'json' }

const verify = Noble.schnorr.verify

const { txhex, utxos, spends, precompute } = test_vectors

const tx = decodeTx(txhex)

export async function test_computehash(t : Test) : Promise<void> {
  t.test('Test the intermediary hashes used for sighash construction.', async t => {
    t.plan(5)
    const outpoints = await SIG.hashOutpoints(tx.input)
    t.equal(Buff.raw(outpoints).hex, precompute.hashPrevouts, 'Outpoint hash should match.')
    const sequence = await SIG.hashSequence(tx.input)
    t.equal(Buff.raw(sequence).hex, precompute.hashSequences, 'Sequence hash should match.')
    const outputs  = await SIG.hashOutputs(tx.output)
    t.equal(Buff.raw(outputs).hex, precompute.hashOutputs, 'Output hash should match.')
    const amounts  = await SIG.hashAmounts(utxos)
    t.equal(Buff.raw(amounts).hex, precompute.hashAmounts, 'Amounts hash should match.')
    const scripts  = await SIG.hashScripts(utxos)
    t.equal(Buff.raw(scripts).hex, precompute.hashScriptPubkeys, 'Scripts hash should match.')
  })
}

export async function test_signatures(t : Test) : Promise<void> {
  t.test('Test vectors for signature hash construction.', async t => {
    const vectors = spends
    t.plan(vectors.length * 3)
    tx.input.map((e, i) => e.prevout = utxos[i])
    for (const { given, intermediary } of vectors) {
      const { txinIndex, hashType } = given
      const { sigHash, tweakedPrivkey } = intermediary
      const actual_hash = await SIG.taprootHash(tx, txinIndex, hashType)
      t.equal(Buff.raw(actual_hash).hex, sigHash, 'The signature hashes should match.')
      const noblepub    = Noble.getPublicKey(tweakedPrivkey, true).slice(1)
      const signature   = await SIG.taprootSign(tweakedPrivkey, tx, txinIndex, hashType)
      const isValidSig  = verify(signature, actual_hash, noblepub)
      t.true(isValidSig, 'The produced signature should be valid.')
      tx.input[txinIndex].witness = [ signature ]
      const isVerified  = await SIG.taprootVerify(tx, txinIndex)
      t.true(isVerified, 'The validation should pass.')
    }
  })
}
