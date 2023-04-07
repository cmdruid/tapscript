import { Test }  from 'tape'
import { Tx }    from '../../../../src/index.js'
import test_data from './valid.vectors.json' assert { type: 'json' }
import { parseVectors } from './utils.js'

export function segwit_vector_test(t :Test) : void {
  const vectors = parseVectors(test_data)
  t.test('Testing segwit valid transaction vectors.', t => {
    let throws = 0
    for (const vector of vectors) {
      const { txhex } = vector
      let newhex : string = 'undefined'
      try {
        const txdata = Tx.decode(txhex)
        newhex = Tx.encode(txdata).hex
        if (txhex !== newhex) {
          throw 'Transaction failed to parse:'
        }
      } catch (err) {
        console.log(err.message)
        console.log('Target:', txhex)
        console.log('Result:', newhex)
        throws += 1
      }
    }
    t.plan(1)
    t.equal(throws, 0, 'All transaction hex should be equal.')
  })
}