import BTON from '../index.js'

let test_tx = {
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
    }
  ],
  vout: [
    {
      value: 1250000000,
      scriptPubkey: [ 0, '9094a9bb2e62972048368ed8a6770f5c8516a0f6' ]
    },
    {
      value: 1249999000,
      scriptPubkey: [ 0, 'f73247687ce333594ed42be5a96f41b3472b85f0']
    }
  ],
  locktime: 0
}

console.log(BTON.encodeTx(test_tx))
