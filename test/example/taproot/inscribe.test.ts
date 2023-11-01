import { Test } from 'tape'
import { Buff } from '@cmdcode/buff'
import fs       from 'fs/promises'
import { URL }  from 'url'

import { tap_pubkey } from '@cmdcode/tapscript/tapkey'
import { taproot }    from '@cmdcode/tapscript/sighash'

import {
  get_seckey,
  get_pubkey
} from '@cmdcode/crypto-tools/keys'

import {
  parse_addr,
  P2TR
} from '@cmdcode/tapscript/address'

import {
  encode_tx,
  parse_tx
} from '@cmdcode/tapscript/tx'

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
    /* The 'marker' bytes. Part of the ordinal inscription format. */
    const marker  = Buff.encode('ord')
    /* Specify the media type of the file. Applications use this when rendering 
     * content. See: https://developer.mozilla.org/en-US/docs/Glossary/MIME_type 
     */
    const mimetype = Buff.encode('image/png')
    // Create a keypair to use for testing.
    const secret = '0a7d01d1c2e1592a02ea7671bb79ecd31d8d5e660b008f4b10e67787f4f24712'
    const seckey = get_seckey(secret)
    const pubkey = get_pubkey(seckey, true)
    // Basic format of an 'inscription' script.
    const script = [ pubkey, 'OP_CHECKSIG', 'OP_0', 'OP_IF', marker, '01', mimetype, 'OP_0', imgdata, 'OP_ENDIF' ]
    // Generate a taproot key and proof data (cblock) from our script.
    const { tapkey, cblock } = tap_pubkey(pubkey, { script })
    // A taproot address is simply the taproot key, encoded in bech32 format.
    const address = P2TR.create(tapkey, 'regtest')
    if (VERBOSE) console.log('Your address:', address)

    /* NOTE: To continue with this example, send 100_000 sats to the printed address.
     * You will also need to make a note of the txid and vout of that funding tx, so
     * that you can include that information below in the redeem tx.
     */ 

    const txdata = parse_tx({
      vin  : [{
        // Replace with the txid of the funding transaction used to send the sats.
        txid: 'b8ed81aca92cd85458966de90bc0ab03409a321758c09e46090988b783459a4d',
        // Replace with the index value of output that you are spending.
        vout: 0,
        // Also include the data from the funding tx output you are spending.
        prevout: {
          // Replace with the amount in the funding output.
          value: 100_000,
          // This is what our address looks like in script format.
          scriptPubKey: [ 'OP_1', tapkey ]
        },
      }],
      vout : [{
        // We are leaving behind 1000 sats as a fee to the miners.
        value: 99_000,
        // Replace with a new address to send your funds to.
        scriptPubKey: parse_addr('bcrt1q6zpf4gefu4ckuud3pjch563nm7x27u4ruahz3y').asm
      }]
    })

    /* For this example, we are using the original secret key to sign.
     * We are also extending the signature to include a commitment to 
     * the script that we wish to use.
     */
    const sig = taproot.sign_tx(seckey, txdata, { script, txindex: 0 })

    /* Add the signature to our witness data for input 0, along with the script
     * and merkle proof (cblock) for the script.
     */
    txdata.vin[0].witness = [ sig, script, cblock ]

    /* Since we are spending from a script, we can pass in a different pubkey
     * to use when checking that the signature is valid. The control block and 
     * script formatting will also be validated, however this library will NOT
     * validate the script execution itself, so be careful!
     */
    const is_valid = taproot.verify_tx(txdata, { txindex : 0, pubkey })

    if (VERBOSE) {
      console.log('Your txhex:', encode_tx(txdata).hex)
      console.dir(txdata, { depth: null })
    }

    t.plan(1)
    t.equal(is_valid, true, 'Transaction should pass validation.')
  })
}
