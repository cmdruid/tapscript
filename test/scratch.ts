import fs          from 'fs/promises'
import path        from 'path'
import { Buff }    from '@cmdcode/buff-utils'
import { KeyPair, Noble } from '@cmdcode/crypto-utils'
import { TxData }  from '../src/index.js'
import { Script, Sig, Tap, Tx } from '../src/index.js'

const ec       = new TextEncoder()
const fpath    = path.join(process.cwd(), '/test')
const data     = await fs.readFile(path.join(fpath, '/image.png')).then(e => new Uint8Array(e))

const seckey   = new KeyPair('043a5a8e482008dc18ef75dd8a6d4b0aaefaa6085af2a207c65d320d3cd8258d')
const pubkey   = seckey.pub.rawX
const mimetype = ec.encode('image/png')
const script   = [ pubkey, 'OP_CHECKSIG' ] // 'OP_0', 'OP_IF', ec.encode('ord'), '01', mimetype, 'OP_0', data, 'OP_ENDIF' ]

const leaf       = await Tap.getLeaf(Script.encode(script))
const [ tapkey ] = await Tap.getPubkey(pubkey, [ leaf ])
const cblock     = await Tap.getPath(pubkey, leaf)

console.log('Tapkey:', tapkey)
console.log('Address: ', Tap.encodeAddress(tapkey, 'bcrt'))

const redeemtx : TxData = {
  version: 2,
  input: [{
    txid: '3dcce7056f7bb20d4f18e0f5664689f68159441a1e95e07d1186f3032e0228c6',
    vout: 0,
    prevout: { value: 100000, scriptPubKey: '5120' + tapkey },
    witness: []
  }],
  output:[{
    value: 90000,
    scriptPubKey: "001439144dbc3c59b3b9b9a6a8275bd4c550129484e8"
  }],
  locktime: 0
}

const sec = await Tap.getSeckey(seckey.raw, [ leaf ])
const sig = await Sig.taproot.sign(seckey.raw, redeemtx, 0, { extention: leaf })

redeemtx.input[0].witness = [ sig ]

console.dir(redeemtx, { depth: null })

// await Sig.taproot.verify(redeemtx, 0, true)

console.log('Txdata:', Tx.encode(redeemtx))
