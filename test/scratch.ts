// import KeyLink       from '@cmdcode/keylink'
import { Buff } from '@cmdcode/buff-utils'
import { SecretKey } from '@cmdcode/crypto-utils'
// import { CLI, WalletInfo }  from './lib/cli.js'
// import { WalletDescriptor } from './lib/descriptors.js'

// const alice = new CLI({ wallet: 'alice' })

// const template = await alice.getTxTemplate()

// console.dir(template, { depth: null })

import { Address, Transaction, Signer, Tx } from "../src/index.js"

const secret = '0bfe1e341a95f3c4d0402df1dea0bf9e505b65a687416402ff3422bceb045d8e'
const seckey = new SecretKey(secret, { type: 'taproot' })
const pubkey = seckey.pub

// const marker   = Buff.encode('ord')
// const mimetype = Buff.encode('plain/txt')

console.log(Address.p2tr.fromPubKey(pubkey))

const txdata = {
  vin  : [{
    txid: 'f1ff8cd7271125997b8acd43b0325249d1ba5b0a05e9158860ed54fad1b58250',
    vout: 0,
    prevout: {
      value: 1500,
      scriptPubKey: [ 'OP_1', pubkey ]
    }
  }],
  vout : [
    {
      value: 0,
      scriptPubKey: [ 'OP_1', pubkey ]
    }
  ]
}

const sig = Signer.taproot.sign(seckey, txdata, 0)

// Let's add this signature to our witness data for input 0.
txdata.vin[0].witness = [ sig ]

// Check if the signature and transaction are valid.
const isValid = Signer.taproot.verify(txdata, 0, { throws: true })

console.log(Tx.encode(txdata).hex)

console.log(Tx.util.getTxid(txdata))
