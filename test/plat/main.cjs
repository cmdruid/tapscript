const { Tx } = require('../../dist/main.cjs')

const txdata = Tx.create_tx({
  vin: [
    {
      txid: '1b4135af95b2728fcf6c77df66e83c7dea903d83856b7cb770983bfad8c32719',
      vout: 0,
      witness: [
        '30440220084d33f3184626e745ded7792ef265230465d90308698a3ea858579428c0ac1f0220528224177f1bba21ddc83716c11d3a04ae28c0cef4f92649ccf9f88775ebe9c401',
      ]
    }
  ],
  vout: [
    {
      value: 1_250_000_000,
      scriptPubKey: [0, '9094a9bb2e62972048368ed8a6770f5c8516a0f6']
    }
  ]
})

console.log('data :', Tx.parse_tx(txdata))
console.log('hex  :', Tx.encode_tx(txdata).hex)