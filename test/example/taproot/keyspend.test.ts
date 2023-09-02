
import { Test } from 'tape'

import * as ecc from '@cmdcode/crypto-utils'

import { Address, SigHash, Tap, Tx, } from '../../../src/index.js'

const { P2TR }    = Address
const { taproot } = SigHash

export async function key_spend (t : Test) : Promise<void> {
  t.test('Basic spend using key-path.', async t => {
    // Switch this to true to enable console output.
    const VERBOSE = false

    // Create a keypair to use for testing.
    const secret = 'ccd54b99acec77d0537b01431579baef998efac6b08e9564bc3047b20ec1bb4c'
    const pubkey = ecc.keys.get_pubkey(secret, true)

    // For key spends, we need the tweaked pubkey (tapkey),
    // plus the tweak itself (for tweaking our seckey later).
    const { tapkey, taptweak } = Tap.key.from_pubkey(pubkey)

    // A taproot address is simply the tweaked public key, encoded in bech32 format.
    const address = P2TR.create(tapkey, 'regtest')
  
    if (VERBOSE) console.log('Your address:', address)

    /* NOTE: To continue with this example, send 100_000 sats to the above address.
      You will also need to make a note of the txid and vout of that transaction,
      so that you can include that information below in the redeem tx.
    */ 

    const txdata = Tx.parse_tx({
      vin  : [{
        // Use the txid of the funding transaction used to send the sats.
        txid: '1ec5b5403bbc7f26a5d3a3ee30d69166a19fa81b49928f010af38fa96986d472',
        // Specify the index value of the output that you are going to spend from.
        vout: 1,
        // Also include the value and script of that ouput.
        prevout: {
          // Feel free to change this if you sent a different amount.
          value: 100_000,
          // This is what our address looks like in script form.
          scriptPubKey: [ 'OP_1', tapkey ]
        },
      }],
      vout : [{
        // We are leaving behind 1000 sats as a fee to the miners.
        value: 99_000,
        // This is the new script that we are locking our funds to.
        scriptPubKey: Address.parse('bcrt1q6zpf4gefu4ckuud3pjch563nm7x27u4ruahz3y').script
      }]
    })

    // For this example, we are signing for input 0 of our transaction.
    const sighash = taproot.hash_tx(txdata, { txindex: 0 })

    // We need to tweak our secret key, then sign the sighash.
    const tap_sec = Tap.tweak.tweak_seckey(secret, taptweak)
    const sig     = ecc.signer.sign(sighash, tap_sec)

    // Let's add this signature to our witness data for input 0.
    txdata.vin[0].witness = [ sig ]

    // Check if the signature and transaction are valid.
    const is_valid = taproot.verify_tx(txdata, { txindex: 0 })

    if (VERBOSE) {
      console.log('Your txhex:', Tx.encode_tx(txdata).hex)
      console.dir(txdata, { depth: null })
    }
    
    t.plan(1)
    t.equal(is_valid, true, 'Transaction should pass validation.')
  })
}
