// import KeyLink       from '@cmdcode/keylink'
import { Buff } from '@cmdcode/buff-utils'
import { SecretKey } from '@cmdcode/crypto-utils'
// import { CLI, WalletInfo }  from './lib/cli.js'
// import { WalletDescriptor } from './lib/descriptors.js'

// const alice = new CLI({ wallet: 'alice' })

// const template = await alice.getTxTemplate()

// console.dir(template, { depth: null })

// 1858f52b6801b72f941ad180235f5401b2d34591952dfe56845d8799718c8274
// 0bfe1e341a95f3c4d0402df1dea0bf9e505b65a687416402ff3422bceb045d8e

import fs from 'fs/promises'
import { Address, Transaction, Signer, Tap, Tx } from "../src/index.js"

const secret = '0bfe1e341a95f3c4d0402df1dea0bf9e505b65a687416402ff3422bceb045d8e'
const seckey = new SecretKey(secret, { type: 'taproot' })
const pubkey = seckey.pub

console.log(seckey.toWIF())

// The 'marker' bytes. Part of the ordinal inscription format.
const marker   = Buff.encode('ord')
// Specify the media type of the file. 
const mimetype = Buff.encode('text/plain;charset=utf-8')
// Get the data blob of the file.
const imgpath = new URL('./still_alive.txt', import.meta.url).pathname
const imgdata = await fs.readFile(imgpath).then(e => new Uint8Array(e))
// Basic format of an 'inscription' script.
const script = [ pubkey, 'OP_CHECKSIG', 'OP_0', 'OP_IF', marker, '01', mimetype, 'OP_0', imgdata, 'OP_ENDIF' ]
// For tapscript spends, we need to convert this script into a 'tapleaf'.
const tapleaf = Tap.encodeScript(script)
// Generate a tapkey that includes our leaf script. Also, create a merlke proof 
// (cblock) that targets our leaf and proves its inclusion in the tapkey.
const [ tpubkey, cblock ] = Tap.getPubKey(pubkey, { target: tapleaf })
// A taproot address is simply the tweaked public key, encoded in bech32 format.
const address = Address.p2tr.fromPubKey(tpubkey, 'regtest')
console.log('Your address:', address)

const txdata = Tx.create({
  vin  : [{
    txid: '8e6f7139ce3fcd7d37f2ec3a4476c5d774f97f08501bbc29a4a7435b305edd1b',
    vout: 1,
    prevout: {
      value: 1500,
      scriptPubKey: [ 'OP_1', tpubkey ]
    }
  }],
  vout : [
    {
      value: 0,
      scriptPubKey: Address.toScriptPubKey('bcrt1pcxfatez49rmunw6fm289qsu7t72skurctgl66v80xxdg3zlmsaaqu0shr0')
    }
  ]
})

const sig = Signer.taproot.sign(seckey, txdata, 0, { extension: tapleaf })

// Let's add this signature to our witness data for input 0.
txdata.vin[0].witness = [ sig, script, cblock ]

// Check if the signature and transaction are valid.
Signer.taproot.verify(txdata, 0, { pubkey, throws: true })

console.log('txid:', Tx.util.getTxid(txdata))
console.log('tx hex:', Tx.encode(txdata).hex)
