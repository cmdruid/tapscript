import { Test }       from 'tape'
import { CoreWallet } from '@cmdcode/core-cmd'
import { Buff }       from '@cmdcode/buff'
import { util }       from '@cmdcode/crypto-tools'

import { Address, Signer, Tap, Tx, } from '../../../src/index.js'

import fs      from 'fs/promises'
import { URL } from 'url'

export async function inscription (t : Test, wallet : CoreWallet) : Promise<void> {
  t.test('Example of an inscription transaction.', async t => {
    t.plan(2)

    // Switch this to true to enable console output.
    const VERBOSE = false

    /** 
    * The code marked below is a quick example of how to load an image 
    * within a NodeJS environment. It may not work in other environments.
    *
    * For examples of how to convert images into binary from within a browser
    * environment, please check out the Web File API:
    * https://developer.mozilla.org/en-US/docs/Web/API/File 
    */
    const imgpath = new URL('./image.png', import.meta.url).pathname
    const imgdata = await fs.readFile(imgpath).then(e => new Uint8Array(e))

    /**
     * Specify the "marker" bytes. Ord uses this to recognize your script
     * as an inscription.
     */
    const marker = Buff.encode('ord')

    /**
     * Specify the media type of the file. Applications use this when rendering 
     * content. See: https://developer.mozilla.org/en-US/docs/Glossary/MIME_type 
     */
    const mimetype = Buff.encode('image/png')

    /**
     * Specify a secret key to use for signing.
     */
    const secret = '0a7d01d1c2e1592a02ea7671bb79ecd31d8d5e660b008f4b10e67787f4f24712'
    const seckey = util.getSecretKey(secret)
    const pubkey = util.getPublicKey(seckey, true)


    // Basic format of an 'inscription' script.
    const script = [ pubkey, 'OP_CHECKSIG', 'OP_0', 'OP_IF', marker, '01', mimetype, 'OP_0', imgdata, 'OP_ENDIF' ]

    // For tapscript spends, we need to convert this script into a 'tapleaf'.
    const tapleaf = Tap.encodeScript(script)

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
        // We are leaving behind 10_000 sats as a fee to the miners.
        value: 90_000,
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
    txdata.vin[0].witness = [ sig, script, cblock ]

    // Check if the signature is valid for the provided public key, and that the
    // transaction is also valid (the merkle proof will be validated as well).
    const isValid = Signer.taproot.verify(txdata, 0, { pubkey, throws: true })

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
