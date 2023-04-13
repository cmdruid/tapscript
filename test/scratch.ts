// import KeyLink       from '@cmdcode/keylink'
// import { Buff } from '@cmdcode/buff-utils'
import { SecretKey } from '@cmdcode/crypto-utils'
// import { CLI, WalletInfo }  from './lib/cli.js'
// import { WalletDescriptor } from './lib/descriptors.js'

// const alice = new CLI({ wallet: 'alice' })

// const template = await alice.getTxTemplate()

// console.dir(template, { depth: null })

import { Address, Transaction, Tx } from "../src/index.js"

const secret = 'ccd54b99acec77d0537b01431579baef998efac6b08e9564bc3047b20ec1bb4c'
const seckey = new SecretKey(secret, { type: 'taproot' })
const pubkey = seckey.pub

console.log(Address.p2tr.fromPubKey(pubkey, 'regtest'))


const txdata = {
  vin  : [{
    txid: '3124490b17c8e6d6e207668ca2cc22fabca445528eee2adbd5a6eaed99f276c8',
    vout: 1,
    prevout: {
      value: 100_000,
      scriptPubKey: [ 'OP_1', pubkey ]
    },
    sequence: 0x11111111
  }],
  vout : [
    {
      value: 99_000,
      scriptPubKey: Address.toScriptPubKey('bcrt1q6zpf4gefu4ckuud3pjch563nm7x27u4ruahz3y')
    },
    {
      value: 0,
      scriptPubKey: Address.toScriptPubKey('bcrt1q6zpf4gefu4ckuud3pjch563nm7x27u4ruahz3y')
    }
  ]
}

console.log(txdata.vin[0].prevout?.scriptPubKey)

const tx = new Transaction(txdata)