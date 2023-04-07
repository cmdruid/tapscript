import { Test }  from 'tape'
import { Buff }  from '@cmdcode/buff-utils'
import { Noble, SecretKey } from '@cmdcode/crypto-utils'

import { decodeTx }        from '../../../../src/lib/tx/decode.js'
import * as HASH           from '../../../../src/lib/sig/taproot/hash.js'
import { TRSigner as SIG } from '../../../../src/lib/sig/taproot/index.js'
import { sign, verify }    from '../../../../src/lib/sig/taproot/sign.js'
import test_vectors        from './sig.vectors.json' assert { type: 'json' }
import { Tap }             from '../../../../src/index.js'

const schnorr = Noble.schnorr

const { txhex, utxos, spends, precompute } = test_vectors

const tx = decodeTx(txhex)

export function test_computehash(t : Test) : void {
  t.test('Test the intermediary hashes used for sighash construction.', t => {
    t.plan(5)
    const outpoints = HASH.hashOutpoints(tx.vin)
    t.equal(Buff.raw(outpoints).hex, precompute.hashPrevouts, 'Outpoint hash should match.')
    const sequence = HASH.hashSequence(tx.vin)
    t.equal(Buff.raw(sequence).hex, precompute.hashSequences, 'Sequence hash should match.')
    const outputs  = HASH.hashOutputs(tx.vout)
    t.equal(Buff.raw(outputs).hex, precompute.hashOutputs, 'Output hash should match.')
    const amounts  = HASH.hashAmounts(utxos)
    t.equal(Buff.raw(amounts).hex, precompute.hashAmounts, 'Amounts hash should match.')
    const scripts  = HASH.hashScripts(utxos)
    t.equal(Buff.raw(scripts).hex, precompute.hashScriptPubkeys, 'Scripts hash should match.')
  })
}

export async function test_signatures(t : Test) : Promise<void> {
  t.test('Test vectors for signature hash construction.', async t => {
    const vectors = spends
    t.plan(vectors.length * 11)
    tx.vin.map((e, i) => e.prevout = utxos[i])
    for (const { given, intermediary, expected } of vectors) {
      // Unpack our vector data.
      const { txinIndex, hashType, internalPrivkey, merkleRoot } = given
      const { sigHash, tweak, internalPubkey, tweakedPrivkey }   = intermediary
      const { witness : [ witsig ] } = expected
      // Test our ability to create the tweak.
      const taptweak = Tap.tweak.getTweak(internalPubkey, merkleRoot ?? undefined)
      t.equal(taptweak.hex, tweak, 'The tap tweak should match.')
      // Test our ability to tweak the private key.\
      const tweakedPrv = Tap.tweak.tweakSecKey(internalPrivkey, taptweak)
      t.equal(tweakedPrv.hex, tweakedPrivkey, 'The tweaked prvkey should match.')
      // Test our ability to calculate the signature hash.
      const actual_hash = SIG.hash(tx, txinIndex, { sigflag: hashType })
      t.equal(actual_hash.hex, sigHash, 'The signature hashes should match.')
      // Test our ability to sign the transaction.
      const pubkey        = new SecretKey(tweakedPrivkey).point.buff
      const tweakedpub    = Buff.raw(Noble.getPublicKey(tweakedPrivkey, true))
      t.equal(pubkey.hex, tweakedpub.hex, 'The tweaked pubkeys should be equal.')
      const signature     = SIG.sign(tweakedPrivkey, tx, txinIndex, { sigflag: hashType, throws : true })
      const testsig       = sign(tweakedPrivkey, sigHash)
      const isVerify      = verify(testsig, sigHash, tweakedpub)
      t.true(isVerify, 'Signature made with sign should be valid using verify.')
      const schnorrVerify = await schnorr.verify(signature.slice(0, 64), sigHash, tweakedpub.slice(1))
      t.true(schnorrVerify, 'The signTx signature should be valid using schnorr.')
      const sigVerify     = verify(signature, actual_hash, tweakedpub)
      t.true(sigVerify, 'The signTx signature should be valid using verify.')
      const vectVerify    = verify(witsig, sigHash, tweakedpub)
      t.true(vectVerify, 'The vector signature should be valid using verify.')
      const checkVerify   = schnorr.verify(witsig, sigHash, tweakedpub)
      t.true(checkVerify, 'The vector signature should be valid using schnorr.')
      const schnorrSig    = await schnorr.sign(actual_hash, tweakedPrivkey)
      const testVerify    = verify(schnorrSig, actual_hash, tweakedpub)
      t.true(testVerify, 'The schnorr signature should be valid using verify.')
      tx.vin[txinIndex].witness = [ signature ]
      const isVerified    = await SIG.verify(tx, txinIndex, { sigflag: hashType, throws : true })
      t.true(isVerified, 'The signature should pass verifyTx')
    }
  })
}
