import { Buff } from '@cmdcode/buff-utils'
import { Address, Script, Signer, Tap, Tx, TxData } from '../src/index.js'

const pkhash = '35c0e7f2d502c44460c0461acfbe924e0dc88d41'
const script = [ 'OP_DUP', 'OP_HASH160', pkhash, 'OP_EQUALVERIFY', 'OP_CHECKSIG' ]

const sbytes = Script.encode(script, false)
console.log(sbytes.hex)

const asm = Script.decode(sbytes)
console.log(asm)

const testtx = {
  version: 1,
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
