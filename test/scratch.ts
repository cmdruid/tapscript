import fs          from 'fs/promises'
import path        from 'path'
import { Buff }    from '@cmdcode/buff-utils'
import { KeyPair } from '@cmdcode/crypto-utils'
import { Script, Sig, Tap, Tx } from '../src/index.js'

const ec       = new TextEncoder()
const fpath    = path.join(process.cwd(), '/test')
const data     = await fs.readFile(path.join(fpath, '/image.png')).then(e => new Uint8Array(e))

const seckey   = new KeyPair('39879f30a087ff472784bafe74b0acfe9bf9ad02639c40211a8a722b6629def6')
const pubkey   = seckey.pub.rawX
const mimetype = ec.encode('image/png')
const script   = [ pubkey, 'OP_CHECKSIG' ] // [ 'OP_0', 'OP_IF', ec.encode('ord'), '01', mimetype, 'OP_0', data, 'OP_ENDIF' ]

const leaf       = await Tap.getLeaf(Script.encode(script))
const [ tapkey ] = await Tap.getPubkey(pubkey, [ leaf ])
const cblock     = await Tap.getPath(pubkey, leaf)

console.log('leaf:', leaf)
console.log('Tapkey:', tapkey)
console.log('Address: ', Tap.encodeAddress(tapkey, 'bcrt'))

const redeemtx = {
  version: 2,
  input: [{
    txid: '1351f611fa0ae6124d0f55c625ae5c929ca09ae93f9e88656a4a82d160d99052',
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

redeemtx.input[0].witness = [ sig, script, cblock ]

console.dir(redeemtx, { depth: null })

// await Sig.taproot.verify(redeemtx, 0, true)

console.log('Txdata:', Tx.encode(redeemtx))
