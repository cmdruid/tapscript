import { Test }       from 'tape'
import { Buff }       from '@cmdcode/buff'
import { CoreWallet } from '@cmdcode/core-cmd'
import { taproot }    from '@cmdcode/tapscript/sighash'
import { tap_pubkey } from '@cmdcode/tapscript/tapkey'
import fs             from 'fs/promises'
import { URL }        from 'url'
import { get_utxo }   from 'test/core.js'

import { assert, util } from '@cmdcode/tapscript'

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

const { VERBOSE = false } = process.env

export async function inscription (
  wallet : CoreWallet,
  tap    : Test
) : Promise<void> {
  /**
   * The code marked below is a quick example of how to load an image 
   * within a NodeJS environment. It may not work in other environments.
   *
   * For examples of how to convert images into binary from within a browser
   * environment, please check out the Web File API:
   * https://developer.mozilla.org/en-US/docs/Web/API/File 
   */

  // We are using core command to run this transaction through bitcoin core.
  const ret_addr = await wallet.new_address
  // Begin the test:
  tap.test('Example of an inscription transaction.', async t => {
   t.plan(1)
    try {
      // Load our image as binary data.
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
      // Send funds to the taproot address and receive a utxo.
      const txinput = await get_utxo(address, 100_000, wallet, true)
      
      if (VERBOSE) console.log('Your address:', address)

      const txdata = parse_tx({
        vin  : [ txinput ],
        vout : [{
          // We are leaving behind 5000 sats as a fee to the miners.
          value: 95_000,
          // Replace with a new address to send your funds to.
          scriptPubKey: parse_addr(ret_addr).asm
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
      
      // Test if the transaction is valid using our verify method.
      const is_valid = taproot.verify_tx(txdata, { txindex : 0, pubkey, throws : true })
      assert.ok(is_valid, 'Transaction failed validation.')
      // Test if the transaction is valid through bitcoin core.
      const txhex = encode_tx(txdata)
      const txid  = await wallet.client.publish_tx(txhex)
      assert.ok(util.is_hex(txid), 'transaction failed to broadcast')

      if (VERBOSE) {
        console.log('Your txid:', txid)
        console.dir(txdata, { depth: null })
      }

      t.pass('transaction broadcast ok')
    } catch (err) {
      if (VERBOSE) console.error(err)
      const { message } = err as Error
      t.fail(message)   
    }
  })
}
