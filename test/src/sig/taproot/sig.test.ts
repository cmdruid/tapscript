import { Test }    from 'tape'
import { Buff }    from '@cmdcode/buff'
import { schnorr } from '@noble/curves/secp256k1'
import { taproot } from '@cmdcode/tapscript/sighash'

import {
  keys,
  signer
} from '@cmdcode/crypto-tools'

import {
  get_taptweak,
  tweak_seckey
} from '@cmdcode/tapscript/tapkey'

import {
  decode_tx,
  create_vout
} from '@cmdcode/tapscript/tx'

import * as HASH from '../../../../src/lib/sig/taproot/hash.js'

import test_vectors from './sig.vectors.json' assert { type: 'json' }

const { txhex, utxos, spends, precompute } = test_vectors

const tx = decode_tx(txhex)

const prevouts = utxos.map(e => create_vout(e))

export function test_computehash(t : Test) {
  t.test('Test the intermediary hashes used for sighash construction.', t => {
    t.plan(5)
    const outpoints = HASH.hash_outpoints(tx.vin)
    t.equal(Buff.raw(outpoints).hex, precompute.hashPrevouts, 'Outpoint hash should match.')
    const sequence = HASH.hash_sequence(tx.vin)
    t.equal(Buff.raw(sequence).hex, precompute.hashSequences, 'Sequence hash should match.')
    const outputs  = HASH.hash_outputs(tx.vout)
    t.equal(Buff.raw(outputs).hex, precompute.hashOutputs, 'Output hash should match.')
    const amounts  = HASH.hash_amounts(prevouts)
    t.equal(Buff.raw(amounts).hex, precompute.hashAmounts, 'Amounts hash should match.')
    const scripts  = HASH.hash_scripts(prevouts)
    t.equal(Buff.raw(scripts).hex, precompute.hashScriptPubkeys, 'Scripts hash should match.')
  })
}

export function test_signatures(t : Test) {
  t.test('Test vectors for signature hash construction.', async t => {
    const vectors = spends
    t.plan(vectors.length * 11)
    tx.vin.map((e, i) => e.prevout = prevouts[i])
    for (const { given, intermediary, expected } of vectors) {
      // Unpack our vector data.
      const { txinIndex, hashType, internalPrivkey, merkleRoot } = given
      const { sigHash, tweak, internalPubkey, tweakedPrivkey }   = intermediary
      let { witness : [ witsig ] } = expected
      // Test our ability to create the tweak.
      const taptweak = get_taptweak(internalPubkey, merkleRoot ?? undefined)
      t.equal(taptweak.hex, tweak, 'The tap tweak should match.')
      // Test our ability to tweak the private key.\
      const tweakedPrv = tweak_seckey(internalPrivkey, taptweak)
      t.equal(tweakedPrv.hex, tweakedPrivkey, 'The tweaked secret key should match.')
      // Test our ability to calculate the signature hash.
      const actual_hash = taproot.hash_tx(tx, { sigflag: hashType, txindex: txinIndex })
      t.equal(actual_hash.hex, sigHash, 'The signature hashes should match.')
      // Test our ability to sign the transaction.
      const pubkey        = keys.get_pubkey(tweakedPrivkey, true)
      const tweakedpub    = Buff.raw(schnorr.getPublicKey(tweakedPrivkey))
      t.equal(pubkey.hex, tweakedpub.hex, 'The tweaked pubkeys should be equal.')
      const testsig       = signer.sign_msg(sigHash, tweakedPrivkey)
      const isVerify      = signer.verify_sig(testsig, sigHash, tweakedpub)
      t.true(isVerify, 'Signature made with sign should be valid using verify.')
      const signature     = taproot.sign_tx(tweakedPrivkey, tx, { sigflag: hashType, txindex : txinIndex, throws : true })
      const schnorrVerify = schnorr.verify(signature.slice(0, 64), sigHash, tweakedpub)
      t.true(schnorrVerify, 'The signTx signature should be valid using schnorr.')
      const sigVerify     = signer.verify_sig(signature, actual_hash, tweakedpub)
      t.true(sigVerify, 'The signTx signature should be valid using verify.')
      const vectVerify    = signer.verify_sig(witsig, sigHash, tweakedpub)
      t.true(vectVerify, 'The vector signature should be valid using verify.')
      const checkVerify   = schnorr.verify(Buff.hex(witsig).slice(0, 64), sigHash, tweakedpub)
      t.true(checkVerify, 'The vector signature should be valid using schnorr.')
      const schnorrSig    = schnorr.sign(actual_hash, tweakedPrivkey)
      const testVerify    = signer.verify_sig(schnorrSig, actual_hash, tweakedpub)
      t.true(testVerify, 'The schnorr signature should be valid using verify.')
      tx.vin[txinIndex].witness = [ signature ]
      const isVerified    = taproot.verify_tx(tx, { sigflag: hashType, txindex: txinIndex, throws : true })
      t.true(isVerified, 'The signature should pass verifyTx')
    }
  })
}
