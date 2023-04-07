import { Buff } from '@cmdcode/buff-utils'
import { Address, Script, Signer, Tap, Tx, TxTemplate } from '../src/index.js'
import test_data  from './src/sig/segwit/bip0143.vectors.json' assert { type: 'json' }

const seckey  = '730fff80e1413068a05b57d6a58261f07551163369787f349438ea38ca80fac6'
const pubkey  = '0307b8ae49ac90a048e9b53357a2354b3334e9c8bee813ecb98e99a7e07e8c3ba3'

const cblock = 'c1187791b6f712a8ea41c8ecdd0ee77fab3e85263b37e1ec18a3651926b3a6cf27'
const { intkey, parity, paths, version } = Tap.util.readCtrlBlock(cblock)

console.log({ intkey: intkey.hex, parity, paths, version })

// const [ tseckey ] = Tap.getSecKey(seckey)
// const [ tpubkey ] = Tap.getPubKey(pubkey)

// const address = Address.p2tr.encode(tpubkey, 'regtest')

// const txdata = Tx.create({
//   vin  : [{
//     txid: 'fbde7872cc1aca4bc93ac9a923f14c3355b4216cac3f43b91663ede7a929471b',
//     vout: 0,
//     prevout: {
//       value: 100000,
//       scriptPubKey: [ 'OP_1', tpubkey ]
//     },
//   }],
//   vout : [{
//     value: 99000,
//     scriptPubKey: Address.toScriptPubKey('bcrt1q6zpf4gefu4ckuud3pjch563nm7x27u4ruahz3y')
//   }]
// })

// // const testspk1 = txdata.vin[0]?.prevout?.scriptPubKey
// // const testspk2 = txdata.vout[0].scriptPubKey

// // console.log(Tx.util.readScriptPubKey(testspk1 ?? ''))
// // console.log(Tx.util.readScriptPubKey(testspk2))

// const sig = Signer.taproot.sign(tseckey, txdata, 0)

// txdata.vin[0].witness = [ sig ]

// await Signer.taproot.verify(txdata, 0, { throws: true })

// console.log('Your address:', address)
// console.log('Your txhex:', Tx.encode(txdata).hex)