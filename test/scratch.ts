import fs            from 'fs/promises'
import path          from 'path'
import { SecretKey } from '@cmdcode/crypto-utils'
import { Address, Script, Sig, Tree, Tweak, Tx, TxData } from '../src/index.js'

const ec       = new TextEncoder()
const fpath    = path.join(process.cwd(), '/test')
const imgdata  = await fs.readFile(path.join(fpath, '/image.png')).then(e => new Uint8Array(e))

/** 
 * Creating an Inscription. 
 */

// Provide your secret key.
const seckey = new SecretKey('39879f30a087ff472784bafe74b0acfe9bf9ad02639c40211a8a722b6629def6', true)
const pubkey = seckey.pub.raw

// We have to provide the 'ord' marker,
// a mimetype for the data, and the blob
// of data itself (as hex or a Uint8Array).
const marker   = ec.encode('ord')        // The 'ord' marker.
const mimetype = ec.encode('image/png')  // The mimetype of the file.
//const imgdata  = getFile('image.png')    // Imaginary method that fetches the file. 

// A basic "inscription" script. The encoder will also 
// break up data blobs and use 'OP_PUSHDATA' when needed.
const script = [
  pubkey, 'OP_CHECKSIG', 'OP_0', 'OP_IF', marker, '01', mimetype, 'OP_0', imgdata, 'OP_ENDIF'
]

// Convert the script into a tapleaf.
const leaf = Tree.getLeaf(Script.encode(script))
// Pass your pubkey and your leaf in order to get the tweaked pubkey.
const [ tapkey ] = Tweak.getPubkey(pubkey, [ leaf ])
// Encode the tweaked pubkey as a bech32m taproot address.
const address    = Address.P2TR.encode(tapkey, 'regtest')

// Once you send funds to this address, please make a note of 
// the transaction's txid, and vout index for this address.
console.log('Your taproot address:', address)

/** 
 * Publishing an Inscription. 
 */

// Get the 'cblock' string (which is the proof used to verify the leaf is in the tree).
const cblock = Tree.getPath(pubkey, leaf, [])

// Construct our redeem transaction.
const txdata : TxData = {
  version : 2,
  input: [
    {
      txid     : 'dc2ff1454bd7b4f7763f82c32a5312fda4080cc08e57293c9078c9797ecb55b9',
      vout     : 1,
      prevout  : {
        value: 100000,
        address: address
      },
      sequence : 0xfffffffd
    }
  ],
  output : [
    { 
      value: 90000, 
      address: 'bcrt1q2tlvgse50z9ch3wtpl45xhfcz2ywk2t57px94c'
    }
  ],
  locktime: 0
}

const sig = Sig.taproot.sign(seckey, txdata, 0, { extension: leaf })

txdata.input[0].witness = [ sig, script, cblock ]

const txhex = Tx.encode(txdata)

console.log('Your transaction:', txdata)
console.log('Your raw transaction hex:', txhex)
