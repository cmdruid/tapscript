import BTON from '../index.js'
import { bytesToHex } from '../src/lib/convert.js'
import { Bech32 } from '../src/lib/format/bech32.js'

const testTx = {
  version: 1,
  vin: [
    {
      txid: '1b4135af95b2728fcf6c77df66e83c7dea903d83856b7cb770983bfad8c32719',
      vout: 0,
      scriptSig: [],
      sequence: 0xFFFFFFFF,
      txWitness: [
        '30440220084d33f3184626e745ded7792ef265230465d90308698a3ea858579428c0ac1f0220528224177f1bba21ddc83716c11d3a04ae28c0cef4f92649ccf9f88775ebe9c401',
        '03c1f09640d7ac03330876ecda7bcf30afa46431898b0e55d037c01d3bd03ec3da'
      ]
    },
    {
      txid: '1b4135af95b2728fcf6c77df66e83c7dea903d83856b7cb770983bfad8c32719',
      vout: 1,
      scriptSig: [],
      sequence: 0xEEEEEEEE,
      txWitness: [
        '30440220084d33f3184626e745ded7792ef265230465d90308698a3ea858579428c0ac1f0220528224177f1bba21ddc83716c11d3a04ae28c0cef4f92649ccf9f88775ebe9c401',
        '03c1f09640d7ac03330876ecda7bcf30afa46431898b0e55d037c01d3bd03ec3da',
        '76a9149094a9bb2e62972048368ed8a6770f5c8516a0f688ac'
      ]
    }
  ],
  vout: [
    {
      value: 1250000000,
      scriptPubkey: [0, '9094a9bb2e62972048368ed8a6770f5c8516a0f6']
    },
    {
      value: 1249999000,
      scriptPubkey: [0, 'c021f50982f8901e92ea7f92b3a3d546568fb9e7']
    }
  ],
  locktime: 0,
  meta: {
    test: 'string'
  }
}

const encoded = BTON.encode.tx(testTx)

console.log(encoded)

const decoded = BTON.decode.tx(encoded)

console.dir(decoded, { depth: null })

const { redeemHash, templateHash } = decoded.vin[1].meta

console.log('redeemHash:', await redeemHash)
console.log('templateHash:', await templateHash)

const payAddress = decoded.vout[1].meta.payAddress

console.log('address:', payAddress)

const data = Bech32.decode(payAddress)

console.log('pubkey:', bytesToHex(data))
