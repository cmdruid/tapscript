import { Test }  from 'tape'
import { Tx }    from '../../../../src/index.js'

import { parseVectors } from './utils.js'

import test_data from './valid.vectors.json' assert { type: 'json' }

export default function (t :Test) : void {
  const vectors = parseVectors(test_data)
  t.test('Testing segwit valid transaction vectors.', t => {
    let throws = 0
    for (const vector of vectors) {
      const { txhex } = vector
      let newhex : string = 'undefined'
      try {
        const txdata = Tx.decode_tx(txhex)
        newhex = Tx.encode_tx(txdata).hex
        if (txhex !== newhex) {
          throw 'Transaction failed to parse:'
        }
      } catch (err) {
        console.log(err)
        console.log('Error:', err.message)
        console.log('Target:', txhex)
        console.log('Result:', newhex)
        throws += 1
      }
    }
    t.plan(1)
    t.equal(throws, 0, 'All transaction hex should be equal.')
  })
}