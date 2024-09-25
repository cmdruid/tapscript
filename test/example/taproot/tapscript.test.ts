import { Test }       from 'tape'
import { util }       from '@cmdcode/crypto-tools'
import { CoreWallet } from '@cmdcode/core-cmd'

import { Address, Script, Signer, Tap, Tx, } from '../../../src/index.js'

export async function script_spend (t : Test, wallet : CoreWallet) : Promise<void> {
  t.test('Basic spend using tapscript.', async t => {
    t.plan(2)

    // Switch this to true to enable console output.
    const VERBOSE = false

    // Create a keypair to use for testing.
    const secret = '0a7d01d1c2e1592a02ea7671bb79ecd31d8d5e660b008f4b10e67787f4f24712'
    const seckey = util.getSecretKey(secret)
    const pubkey = util.getPublicKey(seckey, true)

    // Specify a basic script to use for testing.
    const script = [ pubkey, 'OP_CHECKSIG' ]
    const sbytes = Script.encode(script)

    // For tapscript spends, we need to convert this script into a 'tapleaf'.
    const tapleaf = Tap.tree.getLeaf(sbytes)

    // Generate a tapkey that includes our leaf script. Also, create a merlke proof 
    // (cblock) that targets our leaf and proves its inclusion in the tapkey.
    const [ tpubkey, cblock ] = Tap.getPubKey(pubkey, { target: tapleaf })

    // A taproot address is simply the tweaked public key, encoded in bech32 format.
    const address = Address.p2tr.fromPubKey(tpubkey, 'regtest')
    if (VERBOSE) console.log('Your address:', address)

    // Generate a utxo for testing (using a local core client).
    const utxo = await wallet.create_utxo(100_000, address)

    const txdata = Tx.create({
      vin  : [{
        // Use the txid of the funding transaction used to send the sats.
        txid    : utxo.txid,
        // Specify the index value of the output that you are going to spend from.
        vout    : utxo.vout,
        // Also include the value and script of that ouput.
        prevout : utxo.prevout
      }],
      vout : [{
        // We are leaving behind 1000 sats as a fee to the miners.
        value: 99_000,
        // This is the new script that we are locking our funds to.
        scriptPubKey: Address.toScriptPubKey('bcrt1q6zpf4gefu4ckuud3pjch563nm7x27u4ruahz3y')
      }]
    })

    // For this example, we are signing for input 0 of our transaction,
    // using the untweaked secret key. We are also extending the signature 
    // to include a commitment to the tapleaf script that we wish to use.
    const sig = Signer.taproot.sign(seckey, txdata, 0, { extension: tapleaf })

    // Add the signature to our witness data for input 0, along with the script
    // and merkle proof (cblock) for the script.
    txdata.vin[0].witness = [ sig.hex, script, cblock ]

    // Check if the signature is valid for the provided public key, and that the
    // transaction is also valid (the merkle proof will be validated as well).
    const isValid = Signer.taproot.verify(txdata, 0, { pubkey })

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
