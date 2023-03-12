import fs          from 'fs/promises'
import path        from 'path'
import { Buff }    from '@cmdcode/buff-utils'
import { KeyPair, Noble } from '@cmdcode/crypto-utils'
import { TxData }  from '../src/index.js'
import { Script, Sig, Tap, Tx } from '../src/index.js'

const ec       = new TextEncoder()
const fpath    = path.join(process.cwd(), '/test')
const data     = await fs.readFile(path.join(fpath, '/image.png')).then(e => new Uint8Array(e))

const seckey   = KeyPair.generate()
const pubkey   = seckey.pub.rawX
const mimetype = ec.encode('image/png')
const script   = [ pubkey, 'OP_CHECKSIG', 'OP_0', 'OP_IF', ec.encode('ord'), '01', mimetype, 'OP_0', data, 'OP_ENDIF' ]

const leaf = await Tap.getLeaf(Script.encode(script))

const [ tapkey ] = await Tap.getPubkey(pubkey, [ leaf ])
const ctlblk     = await Tap.getPath(pubkey, leaf)

console.log('Tapkey:', tapkey)
console.log('Address: ', Tap.encodeAddress(tapkey, 'bcrt'))

const redeemtx : TxData = {
  version: 2,
  input: [{
    txid: '8895bda304f26c145e887a6e13cf570780d18a7c3da0a8e372baad2380dc03fc',
    vout: 0,
    prevout: { value: 1000, scriptPubKey: '5120' + tapkey },
    witness: []
  }],
  output:[{
    value: 900,
    scriptPubKey: '001412094e81da0d3462f3d3bd0036b1c9b0abc9638e'
  }],
  locktime: 0
}

const sec = await Tap.getSeckey(seckey.raw, [ leaf ])
const sig = await Sig.taproot.sign(sec, redeemtx, 0)

redeemtx.input[0].witness = [ sig, script, ctlblk ]

console.dir(redeemtx, { depth: null })

// const isValid = await Sig.taproot.verify(redeemtx, 0)

console.log('Txdata:', Tx.encode(redeemtx))
