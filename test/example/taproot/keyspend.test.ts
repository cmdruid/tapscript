
import { Test }       from 'tape'
import { util }       from '@cmdcode/crypto-utils'
import { CoreWallet } from '@cmdcode/core-cmd'

import { Address, Signer, Tap, Tx, } from '../../../src/index.js'

export async function key_spend (t : Test, wallet : CoreWallet) : Promise<void> {
  t.test('Basic spend using key-path.', async t => {
    t.plan(2)
    
    // Switch this to true to enable console output.
    const VERBOSE = false

    // Create a keypair to use for testing.
    const secret = 'ccd54b99acec77d0537b01431579baef998efac6b08e9564bc3047b20ec1bb4c'
    const seckey = util.getSecretKey(secret)
    const pubkey = util.getPublicKey(seckey, true)

    // For key spends, we need to get the tweaked versions
    // of the secret key and public key.
    const [ tseckey ] = Tap.getSecKey(seckey)
    const [ tpubkey ] = Tap.getPubKey(pubkey)

    // Optional: You could also derive the public key from the tweaked secret key.
    const _tpubkey_example = util.getPublicKey(tseckey, true).hex

    // A taproot address is simply the tweaked public key, encoded in bech32 format.
    const address = Address.p2tr.fromPubKey(tpubkey, 'regtest')

    if (VERBOSE) console.log('Your address:', address)

    // Generate a utxo for testing (using a local core client).
    const utxo = await wallet.create_utxo(100_000, address)

    const txdata = Tx.create({
      vin  : [{
        // Use the txid of the funding transaction used to send the sats.
        txid: utxo.txid,
        // Specify the index value of the output that you are going to spend from.
        vout: utxo.vout,
        // Also include the value and script of that ouput.
        prevout: utxo.prevout,
      }],
      vout : [{
        // We are leaving behind 10_000 sats as a fee to the miners.
        value: 90_000,
        // This is the new script that we are locking our funds to.
        scriptPubKey: Address.toScriptPubKey('bcrt1q6zpf4gefu4ckuud3pjch563nm7x27u4ruahz3y')
      }]
    })

    // For this example, we are signing for input 0 of our transaction,
    // using the tweaked secret key.
    const sig = Signer.taproot.sign(tseckey, txdata, 0)

    // Let's add this signature to our witness data for input 0.
    txdata.vin[0].witness = [ sig ]

    // Check if the signature and transaction are valid.
    const isValid = Signer.taproot.verify(txdata, 0)

    t.equal(isValid, true, 'Transaction should pass validation.')

    // Encode the final transaction as hex.
    const txhex = Tx.encode(txdata)
    
    // Publish the transaction using a local bitcoin core client.
    const txid  = await wallet.client.publish_tx(txhex, true)

    t.pass('Transaction broadcast with txid: ' + txid)

    if (VERBOSE) {
      console.log('Your txhex:', Tx.encode(txdata).hex)
      console.dir(txdata, { depth: null })
    }
  })
}
