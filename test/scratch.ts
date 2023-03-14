import fs          from 'fs/promises'
import path        from 'path'
import { Buff }    from '@cmdcode/buff-utils'
import { KeyPair } from '@cmdcode/crypto-utils'
import { Script, Sig, Tap, Tweak, Tx } from '../src/index.js'

const ec       = new TextEncoder()
const fpath    = path.join(process.cwd(), '/test')
const data     = await fs.readFile(path.join(fpath, '/image.png')).then(e => new Uint8Array(e))

const seckey   = new KeyPair('39879f30a087ff472784bafe74b0acfe9bf9ad02639c40211a8a722b6629def6')
const pubkey   = seckey.pub.rawX
const mimetype = ec.encode('image/png')
const script   = [ pubkey, 'OP_CHECKSIG' ] // [ 'OP_0', 'OP_IF', ec.encode('ord'), '01', mimetype, 'OP_0', data, 'OP_ENDIF' ]

const leaf       = await Tap.getLeaf(Script.encode(script))
const [ tapkey ] = await Tweak.getPubkey(pubkey, [ leaf ])
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
  output: [{
    value: 90000,
    address: 'bcrt1pqksclnx3jz0nx9lym4l3zft7gs5gsjgzk8r5vmp5ul6fpc8xyldqaxu8ys'
  }],
  locktime: 0
}

// const sec = await Tap.getSeckey(seckey.raw, [ leaf ])
// const sig = await Sig.taproot.sign(seckey.raw, redeemtx, 0, { extension: leaf })

// redeemtx.input[0].witness = [ sig, script, cblock ]

// console.dir(redeemtx, { depth: null })

// await Sig.taproot.verify(redeemtx, 0, true)

const txhex = Tx.encode(redeemtx)
console.log('Txdata:', txhex)
console.log('Txdata:', Tx.decode(txhex))
