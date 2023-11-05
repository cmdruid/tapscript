
import { Test }         from 'tape'
import { CoreWallet }   from '@cmdcode/core-cmd'
import { get_utxo }     from 'test/core.js'
import { assert, util } from '@cmdcode/tapscript'
import { get_pubkey }   from '@cmdcode/crypto-tools/keys'
import { taproot }      from '@cmdcode/tapscript/sighash'

import {
  parse_addr,
  P2TR
} from '@cmdcode/tapscript/address'

import {
  tap_pubkey,
  tweak_seckey
} from '@cmdcode/tapscript/tapkey'

import {
  encode_tx,
  parse_tx
} from '@cmdcode/tapscript/tx'

const { VERBOSE = false } = process.env

export async function key_spend (
  wallet : CoreWallet,
  tap    : Test
) : Promise<void> {
  // We are using core command to run this transaction through bitcoin core.
  const ret_addr = await wallet.new_address
  // Begin the test:
  tap.test('Basic spend using key-path.', async t => {
    t.plan(1)
    try {
      // Create a keypair to use for testing.
      const secret = 'ccd54b99acec77d0537b01431579baef998efac6b08e9564bc3047b20ec1bb4c'
      const pubkey = get_pubkey(secret, true)

      // For key spends, we need the tweaked pubkey (tapkey),
      // plus the tweak itself (for tweaking our seckey later).
      const { tapkey, taptweak } = tap_pubkey(pubkey)

      // A taproot address is simply the tweaked public key, encoded in bech32 format.
      const address = P2TR.create(tapkey, 'regtest')
      // Send funds to the taproot address and receive a utxo.
      const txinput = await get_utxo(address, 100_000, wallet, true)

      if (VERBOSE) console.log('Your tapkey address:', address)

      /* NOTE: To continue with this example, send 100_000 sats to the above address.
        You will also need to make a note of the txid and vout of that transaction,
        so that you can include that information below in the redeem tx.
      */

      const txdata = parse_tx({
        vin  : [ txinput ],
        vout : [{
          // We are leaving behind 1000 sats as a fee to the miners.
          value: 99_000,
          // This is the new script that we are locking our funds to.
          scriptPubKey: parse_addr(ret_addr).asm
        }]
      })

      // We need to tweak our secret key, then sign the tx.
      const tap_sec = tweak_seckey(secret, taptweak)
      const sig     = taproot.sign_tx(tap_sec, txdata, { txindex: 0 })

      // Let's add this signature to our witness data for input 0.
      txdata.vin[0].witness = [ sig ]

      // Test if the transaction is valid using our verify method.
      const is_valid = taproot.verify_tx(txdata, { txindex : 0, throws : true })
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
