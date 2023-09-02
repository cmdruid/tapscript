import { create_tx } from '../src/lib/tx/create.js'

const test = create_tx({
  vin : [{
    txid: '60a20bd93aa49ab4b28d514ec10b06e1829ce6818ec06cd3aabd013ebcdc4bb1',
    vout: 0,
    scriptSig: [ 'OP_ADD', 4, 'OP_FAKE' ]
  }]
})

console.log(test)
