import fs   from 'fs/promises'
import path from 'path'

import { Buff }      from '@cmdcode/buff-utils'
import { SecretKey } from '@cmdcode/crypto-utils'

import { Address, Script, Signer, Tap, TxData } from '../../../src/index.js'

const ec      = new TextEncoder()
const seckey  = SecretKey.random()
const pubkey  = seckey.pub.rawX
const fpath   = path.join(process.cwd(), '/test')
const imgdata = await fs.readFile(path.join(fpath, '/image.png')).then(e => new Uint8Array(e))
const chksum  = (await fs.readFile(path.join(fpath, '/checksum'))).toString()
 
const marker   = ec.encode('ord')
const mimetype = ec.encode('image/png')
const recvAddr = '51206364d5d918f22e75d4e2dea50ec28792829d0b4546b9bc8a02d4b3965f638000'

const script = [ pubkey, 'OP_CHECKSIG', 'OP_0', 'OP_IF', marker, '01', mimetype, 'OP_0', imgdata, 'OP_ENDIF' ]

const hexscript = Script.encode(script, false).hex

if (hexscript !== chksum) throw new Error('Script does not match checksum!')

const leaf = Tap.tree.getLeaf(Script.encode(script))
// Pass your pubkey and your leaf in order to get the tweaked pubkey.
const [ tapkey, cblock ] = Tap.getPubKey(pubkey, { target: leaf })
// Encode the tweaked pubkey as a bech32m taproot address.
const address = Address.p2tr.encode(tapkey, 'regtest')

// Once you send funds to this address, please make a note of 
// the transaction's txid, and vout index for this address.
console.log('Your taproot address:', address)

/** 
 * Publishing an Inscription. 
 */

// Construct our redeem transaction.
const txdata : TxData = {
  version : 2,
  vin: [
    {
      txid     : 'dc2ff1454bd7b4f7763f82c32a5312fda4080cc08e57293c9078c9797ecb55b9',
      vout     : 1,
      prevout  : {
        value: 100000,
        scriptPubKey: Address.toScript(address)
      },
      sequence : 0xfffffffd
    }
  ],
  vout : [
    { 
      value: 90000, 
      scriptPubKey: Address.toScript('bcrt1q2tlvgse50z9ch3wtpl45xhfcz2ywk2t57px94c')
    }
  ],
  locktime: 0
}

const sig = Signer.taproot.sign(seckey, txdata, 0, { extension: leaf })

txdata.vin[0].witness = [ sig, script, cblock ]

Signer.taproot.verify(txdata, 0, { pubkey, throws: true })
