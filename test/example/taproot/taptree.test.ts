import { Test } from 'tape'
import * as ecc from '@cmdcode/crypto-utils'
import { Address, SigHash, Tap, Tx, } from '../../../src/index.js'

const { P2TR }    = Address
const { taproot } = SigHash

export async function tree_spend (t : Test) : Promise<void> {
  t.test('Spend a script inside a tree.', async t => {
    // Switch this to true to enable console output.
    const VERBOSE = false

    // Create a keypair to use for testing.
    const secret = '0a7d01d1c2e1592a02ea7671bb79ecd31d8d5e660b008f4b10e67787f4f24712'
    const pubkey = ecc.keys.get_pubkey(secret, true)

    // Specify an array of scripts to use for testing.
    const scripts = [
      [ 1, 7, 'OP_ADD', 8, 'OP_EQUALVERIFY', pubkey, 'OP_CHECKSIG' ],
      [ 2, 6, 'OP_ADD', 8, 'OP_EQUALVERIFY', pubkey, 'OP_CHECKSIG' ],
      [ 3, 5, 'OP_ADD', 8, 'OP_EQUALVERIFY', pubkey, 'OP_CHECKSIG' ],
      [ 4, 4, 'OP_ADD', 8, 'OP_EQUALVERIFY', pubkey, 'OP_CHECKSIG' ],
      [ 5, 3, 'OP_ADD', 8, 'OP_EQUALVERIFY', pubkey, 'OP_CHECKSIG' ],
      [ 6, 2, 'OP_ADD', 8, 'OP_EQUALVERIFY', pubkey, 'OP_CHECKSIG' ],
      [ 7, 1, 'OP_ADD', 8, 'OP_EQUALVERIFY', pubkey, 'OP_CHECKSIG' ]
    ]

    // Convert our array of scripts into tapleaves.
    const tree = scripts.map(s => Tap.encode.script(s))

    if (VERBOSE) console.log('tree:', tree)

    // Pick one of our scripts as a target for spending.
    const index  = Math.floor(Math.random() * 10) % 7
    const script = scripts[index]
    const target = Tap.encode.script(script)

    if (VERBOSE) console.log('target:', target)

    // Generate a tapkey that includes our tree. Also, create a merlke proof 
    // (cblock) that targets our leaf and proves its inclusion in the tapkey.
    const { tapkey, cblock }= Tap.key.from_pubkey(pubkey, { tree, target })

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
        txid: 'e0b1b0aea95095bf7e113c37562a51cb8c3f50f5145c17952e766f7a84fcc5d7',
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
        scriptPubKey: Address.parse('bcrt1q6zpf4gefu4ckuud3pjch563nm7x27u4ruahz3y').script
      }]
    })

    // For this example, we are signing for input 0 of our transaction,
    // using the untweaked secret key. We are also extending the signature 
    // to include a commitment to the tapleaf script that we wish to use.
    const opt = { txindex: 0, extension: target }
    const sig = taproot.sign_tx(secret, txdata, opt)

    // Add the signature to our witness data for input 0, along with the script
    // and merkle proof (cblock) for the script.
    txdata.vin[0].witness = [ sig.hex, script, cblock ]

    // Check if the signature is valid for the provided public key, and that the
    // transaction is also valid (the merkle proof will be validated as well).
    const isValid = await taproot.verify_tx(txdata, { txindex: 0, pubkey })

    if (VERBOSE) {
      console.log('Your txhex:', Tx.encode_tx(txdata).hex)
      console.dir(txdata, { depth: null })
    }

    t.plan(1)
    t.equal(isValid, true, 'Transaction should pass validation.')
  })
}
