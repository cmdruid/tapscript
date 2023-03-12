import fs   from 'fs/promises'
import path from 'path'
import { Buff }    from '@cmdcode/buff-utils'
import { KeyPair } from '@cmdcode/crypto-utils'
import { Script, Sig, Tap, Tx } from '../src/index.js'
import { TxData }  from '../src/index.js'

const ec     = new TextEncoder()
const seckey = KeyPair.generate()
const pubkey = seckey.pub.rawX
const fpath  = path.join(process.cwd(), '/test')
const data   = await fs.readFile(path.join(fpath, '/image.png')).then(e => new Uint8Array(e))

const mimetype = ec.encode('image/png')
const recvAddr = '51206364d5d918f22e75d4e2dea50ec28792829d0b4546b9bc8a02d4b3965f638000'

const script = [ pubkey, 'OP_CHECKSIG', 'OP_0', 'OP_IF', ec.encode('ord'), '01', mimetype, 'OP_0', data, 'OP_ENDIF' ]

const hexscript = Buff.raw(Script.encode(script, false)).hex
const leaf      = await Tap.getLeaf(data)
const decscript = Script.decode(hexscript)

// console.log('Script:', decscript)

const [ tapkey ] = await Tap.getKey(pubkey, [ leaf ])
const ctlblk = await Tap.getPath(pubkey, [], hexscript)

console.log('Address: ', Tap.encodeAddress(tapkey))

const redeemtx : TxData = {
  version: 2,
  input: [{
    txid: '',
    vout: 0,
    prevout: { value: 10000, scriptPubKey: [ tapkey ] },
    witness: []
  }],
  output:[{
    value: 10000,
    scriptPubKey: recvAddr
  }],
  locktime: 0
}

const sig = await Sig.taproot.sign(seckey.raw, redeemtx, 0)

redeemtx.input[0].witness?.push(sig, script, ctlblk)

console.log('Tx:', redeemtx)
console.log('Txdata:', Tx.encode(redeemtx))
