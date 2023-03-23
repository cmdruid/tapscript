import { Test }  from 'tape'
import { Buff }  from '@cmdcode/buff-utils'
import { Noble } from '@cmdcode/crypto-utils'

import { decodeTx } from '../../../src/lib/tx/decode.js'
import * as SIG     from '../../../src/lib/sig/taproot.js'
import test_vectors from './sig.vectors.json' assert { type: 'json' }
import { Tweak }    from '../../../src/index.js'

import * as TESTSIG from '../../../src/lib/sig/signer.js'

const schnorr = Noble.schnorr

const { txhex, utxos, spends, precompute } = test_vectors

const tx = decodeTx(txhex)

export async function test_computehash(t : Test) : Promise<void> {
  t.test('Test the intermediary hashes used for sighash construction.', async t => {
    t.plan(5)
    const outpoints = SIG.hashOutpoints(tx.input)
    t.equal(Buff.raw(outpoints).hex, precompute.hashPrevouts, 'Outpoint hash should match.')
    const sequence = SIG.hashSequence(tx.input)
    t.equal(Buff.raw(sequence).hex, precompute.hashSequences, 'Sequence hash should match.')
    const outputs  = SIG.hashOutputs(tx.output)
    t.equal(Buff.raw(outputs).hex, precompute.hashOutputs, 'Output hash should match.')
    const amounts  = SIG.hashAmounts(utxos)
    t.equal(Buff.raw(amounts).hex, precompute.hashAmounts, 'Amounts hash should match.')
    const scripts  = SIG.hashScripts(utxos)
    t.equal(Buff.raw(scripts).hex, precompute.hashScriptPubkeys, 'Scripts hash should match.')
  })
}

export async function test_signatures(t : Test) : Promise<void> {
  t.test('Test vectors for signature hash construction.', async t => {
    const vectors = spends
    t.plan(vectors.length * 8)
    tx.input.map((e, i) => e.prevout = utxos[i])
    for (const { given, intermediary } of vectors) {
      // Unpack our vector data.
      const { txinIndex, hashType, internalPrivkey, merkleRoot } = given
      const { sigHash, tweak, internalPubkey, tweakedPrivkey }   = intermediary
      // Test our ability to create the tweak.
      const taptweak = Tweak.getTweak(internalPubkey, merkleRoot ?? new Uint8Array())
      t.equal(Buff.raw(taptweak).hex, tweak, 'The tap tweak should match.')
      // Test our ability to tweak the private key.
      const tweakedPrv  = Tweak.tweakSeckey(internalPrivkey, tweak)
      t.equal(Buff.raw(tweakedPrv).hex, tweakedPrivkey, 'The tweaked prvkey should match.')
      // Test our ability to calculate the signature hash.
      const actual_hash = SIG.hashTx(tx, txinIndex, { sigflag: hashType })
      t.equal(Buff.raw(actual_hash).hex, sigHash, 'The signature hashes should match.')
      // Test our ability to sign the transaction.
      const tweakedpub  = Noble.getPublicKey(tweakedPrivkey, true).slice(1)
      const signature     = SIG.signTx(tweakedPrivkey, tx, txinIndex, { sigflag: hashType })
      const schnorrVerify = schnorr.verify(signature, actual_hash, tweakedpub)
      t.true(schnorrVerify, 'The signTx signature should be valid using schnorr.')
      const sigVerify    = TESTSIG.verify(signature, actual_hash, tweakedpub)
      t.true(sigVerify, 'The signTx signature should be valid using TESTSIG.verify.')
      const schnorrSig    = await schnorr.sign(actual_hash, tweakedPrivkey)
      const testVerify    = TESTSIG.verify(schnorrSig, actual_hash, tweakedpub)
      t.true(testVerify, 'The schnorr signature should be valid using TESTSIG.verify.')
      tx.input[txinIndex].witness = [ signature ]
      const isVerified  = await SIG.verifyTx(tx, txinIndex, { sigflag: hashType })
      t.true(isVerified, 'The signature should pass verifyTx')
      const testsig   = TESTSIG.sign(tweakedPrivkey, sigHash).raw
      const isVerify  = TESTSIG.verify(testsig, sigHash, tweakedpub)
      t.true(isVerify, 'Signature made with TESTSIG should be valid using TESTSIG.verify.')
    }
  })
}
