import { Test } from 'tape'
import { SecretKey } from '@cmdcode/crypto-utils'
import { Address, Script, Signer, Tap, Tx, } from '../src/index.js'

// Switch this to true to enable console output.
const VERBOSE = true

// Create a keypair to use for testing.
const seckey = new SecretKey('0a7d01d1c2e1592a02ea7671bb79ecd31d8d5e660b008f4b10e67787f4f24712')
// Make sure to use the x-only version of the public key.
const pubkey = seckey.pub.hexX

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
const tree = scripts.map(s => Tap.encodeScript(s))

if (VERBOSE) console.log('tree:', tree)

// Pick one of our scripts as a target for spending.
const script = scripts[5]
const target = Tap.encodeScript(script)

if (VERBOSE) console.log('target:', target)

// Generate a tapkey that includes our tree. Also, create a merlke proof 
// (cblock) that targets our leaf and proves its inclusion in the tapkey.
const [ tpubkey, cblock ] = Tap.getPubKey(pubkey, { tree, target })

// A taproot address is simply the tweaked public key, encoded in bech32 format.
const address = Address.p2tr.fromPubKey(tpubkey, 'regtest')
if (VERBOSE) console.log('Your address:', address)

/* NOTE: To continue with this example, send 100_000 sats to the above address.
   You will also need to make a note of the txid and vout of that transaction,
   so that you can include that information below in the redeem tx.
*/ 

const txdata = Tx.create({
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
      scriptPubKey: [ 'OP_1', tpubkey ]
    },
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
const sig = Signer.taproot.sign(seckey, txdata, 0, { extension: target })

// Add the signature to our witness data for input 0, along with the script
// and merkle proof (cblock) for the script.
txdata.vin[0].witness = [ sig.hex, script, cblock ]

// Check if the signature is valid for the provided public key, and that the
// transaction is also valid (the merkle proof will be validated as well).
const isValid = await Signer.taproot.verify(txdata, 0, { pubkey })

if (VERBOSE) {
  console.log('Your txhex:', Tx.encode(txdata).hex)
  console.dir(txdata, { depth: null })
}
