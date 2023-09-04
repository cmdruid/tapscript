import { Test } from 'tape'
import { Buff } from '@cmdcode/buff-utils'

import { Address, SigHash, Tap, Tx, } from '../../../src/index.js'

import fs      from 'fs/promises'
import { URL } from 'url'

const { P2TR }    = Address
const { taproot } = SigHash

export async function inscription (t : Test) : Promise<void> {
  t.test('Example of an inscription transaction.', async t => {
    // Switch this to true to enable console output.
    const VERBOSE = false

    /* The code marked below is a quick example of how to load an image 
    * within a NodeJS environment. It may not work in other environments.
    *
    * For examples of how to convert images into binary from within a browser
    * environment, please check out the Web File API:
    * https://developer.mozilla.org/en-US/docs/Web/API/File 
    */
    const imgpath = new URL('./image.png', import.meta.url).pathname
    const imgdata = await fs.readFile(imgpath).then(e => new Uint8Array(e))
    /* * */

    // The 'marker' bytes. Part of the ordinal inscription format.
    const marker   = Buff.encode('ord')
    /* Specify the media type of the file. Applications use this when rendering 
     * content. See: https://developer.mozilla.org/en-US/docs/Glossary/MIME_type 
     */
    const mimetype = Buff.encode('image/png')
    // Create a keypair to use for testing.
    const secret = '0a7d01d1c2e1592a02ea7671bb79ecd31d8d5e660b008f4b10e67787f4f24712'
    const seckey = SigHash.get_seckey(secret)
    const pubkey = SigHash.get_pubkey(seckey, true)
    // Basic format of an 'inscription' script.
    const script = [ pubkey, 'OP_CHECKSIG', 'OP_0', 'OP_IF', marker, '01', mimetype, 'OP_0', imgdata, 'OP_ENDIF' ]
    // For tapscript spends, we need to convert this script into a 'tapleaf'.
    const tapleaf = Tap.encode.script(script)
    // Generate a tapkey that includes our leaf script. Also, create a merlke proof 
    // (cblock) that targets our leaf and proves its inclusion in the tapkey.
    const { tapkey, cblock } = Tap.key.from_pubkey(pubkey, { target: tapleaf })
    // A taproot address is simply the tweaked public key, encoded in bech32 format.
    const address = P2TR.create(tapkey, 'regtest')
    if (VERBOSE) console.log('Your address:', address)

    /* NOTE: To continue with this example, send 100_000 sats to the above address.
     * You will also need to make a note of the txid and vout of that transaction,
     * so that you can include that information below in the redeem tx.
     */ 

    const txdata = Tx.parse_tx({
      vin  : [{
        // Use the txid of the funding transaction used to send the sats.
        txid: 'b8ed81aca92cd85458966de90bc0ab03409a321758c09e46090988b783459a4d',
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
    const sig = taproot.sign_tx(seckey, txdata, { extension: tapleaf, txindex: 0 })

    // Add the signature to our witness data for input 0, along with the script
    // and merkle proof (cblock) for the script.
    txdata.vin[0].witness = [ sig, script, cblock ]

    // Check if the signature is valid for the provided public key, and that the
    // transaction is also valid (the merkle proof will be validated as well).
    const isValid = taproot.verify_tx(txdata, { txindex : 0, pubkey, throws: true })

    if (VERBOSE) {
      console.log('Your txhex:', Tx.encode_tx(txdata).hex)
      console.dir(txdata, { depth: null })
    }

    t.plan(1)
    t.equal(isValid, true, 'Transaction should pass validation.')
  })
}
