import fs            from 'fs/promises'
import path          from 'path'
import { SecretKey } from '@cmdcode/crypto-utils'
import { Address, Script, Sig, Transaction, Tree, Tweak, Tx, TxData } from '../src/index.js'
import { Buff } from '@cmdcode/buff-utils'

const ec       = new TextEncoder()
const fpath    = path.join(process.cwd(), '/test')
const imgdata  = await fs.readFile(path.join(fpath, '/image.png')).then(e => new Uint8Array(e))

/** 
 * Creating an Inscription. 
 */

// Provide your secret key.
const seckey = new SecretKey('39879f30a087ff472784bafe74b0acfe9bf9ad02639c40211a8a722b6629def6')
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
const [ tapkey ] = Tweak.getPubkey(pubkey, leaf)
// Encode the tweaked pubkey as a bech32m taproot address.
const address = Address.P2TR.encode(tapkey, 'regtest')

// Once you send funds to this address, please make a note of 
// the transaction's txid, and vout index for this address.
console.log('Your taproot address:', address)
console.log('leaf:', leaf)
console.log('tapkey:', tapkey)
console.log('pubkey:', Buff.raw(pubkey).hex)

/** 
 * Publishing an Inscription. 
 */

// Get the 'cblock' string (which is the proof used to verify the leaf is in the tree).
const cblock = Tree.getPath(pubkey, leaf)

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

const sig = Sig.taproot.sign(seckey, txdata, 0, { extension: leaf })

txdata.vin[0].witness = [ sig, script, cblock ]

Sig.taproot.verify(txdata, 0, { pubkey, throws: true })

// console.dir(txdata, { depth: null })

const txhex = Tx.encode(txdata).hex

// console.log('Your transaction:', txdata)
console.log('Your raw transaction hex:', txhex)


// console.log(test)

// const tx = new Transaction(txdata)

// console.dir(tx, { depth: null })

const testtx = {
  version: 2,
  vin: [
    {
      txid: '9c4e333b5f116359b5f5578fe4a74c6f58b3bab9d28149a583da86f6bf0ce27d',
      vout: 1,
      scriptSig: [],
      sequence: '00000000',
      prevout: {
        scriptPubKey: '512053a1f6e454df1aa2776a2814a721372d6258050de330b3c6d10ee8f4e0dda343',
        value: 420000000
      },
      witness: [
        '5c0d96eac618eccf74e65ba848b73b780ab2bb7fb57a80338be39c12b71935991bef96c3a8cb595028c38d21bbdb0c8f33a97d15bd1d09f1410633e1e72baf4f03'
      ]
    },
    {
      txid: '99ddaf6d9b75447d5127e17312f6def68acba2d4f464d0e2ac93137bb5cab7d7',
      vout: 0,
      scriptSig: [],
      sequence: 'ffffffff',
      prevout: {
        scriptPubKey: '5120147c9c57132f6e7ecddba9800bb0c4449251c92a1e60371ee77557b6620f3ea3',
        value: 462000000
      }
    },
    {
      txid: '4218a419542757d960174457dc82e06b3613ac8ed2c528926833433883f5e1f8',
      vout: 0,
      scriptSig: [],
      sequence: 'ffffffff',
      prevout: {
        scriptPubKey: '76a914751e76e8199196d454941c45d1b3a323f1433bd688ac',
        value: 294000000
      }
    },
    {
      txid: '3b8504d63a84a0fd1043e7ec832adaeeb7382a6d3ca762b10cb363aa809168f0',
      vout: 1,
      scriptSig: [],
      sequence: 'fffffffe',
      prevout: {
        scriptPubKey: '5120e4d810fd50586274face62b8a807eb9719cef49c04177cc6b76a9a4251d5450e',
        value: 504000000
      }
    },
    {
      txid: '6cbae03912ee525a3cfd5b5ea264921d46b7bbaf02020feed2ccd8f6bd0252aa',
      vout: 0,
      scriptSig: [],
      sequence: 'fffffffe',
      prevout: {
        scriptPubKey: '512091b64d5324723a985170e4dc5a0f84c041804f2cd12660fa5dec09fc21783605',
        value: 630000000
      }
    },
    {
      txid: '50d0ac326d44a3a29358214139fecb8a7129aa2f2dbeb28e96aa6fc6bd496195',
      vout: 0,
      scriptSig: [],
      sequence: '00000000',
      prevout: {
        scriptPubKey: '00147dd65592d0ab2fe0d0257d571abf032cd9db93dc',
        value: 378000000
      }
    },
    {
      txid: '944c5f5d1dbb1b5348f8223bbab763ed0cdae4a3a270cb329cc0883b77b964e6',
      vout: 1,
      scriptSig: [],
      sequence: '00000000',
      prevout: {
        scriptPubKey: '512075169f4001aa68f15bbed28b218df1d0a62cbbcf1188c6665110c293c907b831',
        value: 672000000
      }
    },
    {
      txid: 'bfead4dfeaf74ea732a677b64b697bbb9656e24a92a3e61976e69d6c8e6baae9',
      vout: 0,
      scriptSig: [],
      sequence: 'ffffffff',
      prevout: {
        scriptPubKey: '5120712447206d7a5238acc7ff53fbe94a3b64539ad291c7cdbc490b7577e4b17df5',
        value: 546000000
      }
    },
    {
      txid: 'f12ab8a18a051d836804111c0b726796a9b566c425d14c4690c03d266aeb78a7',
      vout: 1,
      scriptSig: [],
      sequence: 'ffffffff',
      prevout: {
        scriptPubKey: '512077e30a5522dd9f894c3f8b8bd4c4b2cf82ca7da8a3ea6a239655c39c050ab220',
        value: 588000000
      }
    }
  ],
  vout: [
    {
      value: 1000000000n,
      scriptPubKey: '76a91406afd46bcdfd22ef94ac122aa11f241244a37ecc88ac'
    },
    {
      value: 3410000000n,
      scriptPubKey: 'ac9a87f5594be208f8532db38cff670c450ed2fea8fcdefcc9a663f78bab962b'
    }
  ],
  locktime: 500000000
}

// const test = Tx.fmt.toJson(testtx)