import { Test } from 'tape'

import { get_pubkey } from '@cmdcode/crypto-tools/keys'
import { tap_pubkey } from '@cmdcode/tapscript/tapkey'
import { taproot }    from '@cmdcode/tapscript/sighash'

import {
  parse_addr,
  P2TR
} from '@cmdcode/tapscript/address'

import {
  encode_tx,
  parse_tx
} from '@cmdcode/tapscript/tx'

export async function script_spend (t : Test) : Promise<void> {
  t.test('Basic spend using tapscript.', async t => {

    // Switch this to true to enable console output.
    const VERBOSE = false

    // Create a keypair to use for testing.
    const secret = '0a7d01d1c2e1592a02ea7671bb79ecd31d8d5e660b008f4b10e67787f4f24712'
    const pubkey = get_pubkey(secret, true)

    // Specify a basic script to use for testing.
    const script = [ pubkey, 'OP_CHECKSIG' ]

    // Generate a tapkey that includes our leaf script. Also, create a merlke proof 
    // (cblock) that targets our leaf and proves its inclusion in the tapped key.
    const { tapkey, cblock } = tap_pubkey(pubkey, { script })

    // A taproot address is simply the tweaked public key, encoded in bech32 format.
    const address = P2TR.create(tapkey, 'regtest')
    if (VERBOSE) console.log('Your address:', address)

    /* NOTE: To continue with this example, send 100_000 sats to the above address.
      You will also need to make a note of the txid and vout of that transaction,
      so that you can include that information below in the redeem tx.
    */ 

    const txdata = parse_tx({
      vin  : [{
        // Use the txid of the funding transaction used to send the sats.
        txid: '181508e3be1107372f1ffcbd52de87b2c3e7c8b2495f1bc25f8cf42c0ae167c2',
        // Specify the index value of the output that you are going to spend from.
        vout: 0,
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
        scriptPubKey: parse_addr('bcrt1q6zpf4gefu4ckuud3pjch563nm7x27u4ruahz3y').asm
      }]
    })

    // For this example, we are signing for input 0 of our transaction,
    // using the untweaked secret key. We are also extending the signature 
    // to include a commitment to the tapleaf script that we wish to use.
    const opt = { txindex: 0, script }
    const sig = taproot.sign_tx(secret, txdata, opt)

    // Add the signature to our witness data for input 0, along with the script
    // and merkle proof (cblock) for the script.
    txdata.vin[0].witness = [ sig.hex, script, cblock ]

    // Check if the signature is valid for the provided public key, and that the
    // transaction is also valid (the merkle proof will be validated as well).
    const isValid = taproot.verify_tx(txdata, { pubkey, txindex: 0, throws: true })

    if (VERBOSE) {
      console.log('Your txhex:', encode_tx(txdata).hex)
      console.dir(txdata, { depth: null })
    }
    
    t.plan(1)
    t.equal(isValid, true, 'Transaction should pass validation.')
  })
}
