import { Test }    from 'tape'
import { Buff }    from '@cmdcode/buff'
import { TxInput } from '@cmdcode/tapscript'

import {
  create_vin,
  encode_tx,
  decode_tx
} from '@cmdcode/tapscript/tx'

import test_data from './valid.vectors.json' assert { type: 'json' }

type TestInput = [
  prev_hash : string,
  prev_idx  : number,
  prev_spk  : string,
  prev_amt  : number
]

type TestData = [
  inputs : TestInput[],
  txhex  : string,
  flags  : string
]

interface TestVector {
  txhex  : string
  inputs : TxInput[]
  flags  : string[]
}

export default function (t :Test) : void {
  const vectors = parse_vectors(test_data)
  t.test('Testing segwit valid transaction vectors.', t => {
    let throws = 0
    for (const vector of vectors) {
      const { txhex } = vector
      let newhex : string = 'undefined'
      try {
        const txdata = decode_tx(txhex)
        newhex = encode_tx(txdata).hex
        if (txhex !== newhex) {
          throw 'Transaction failed to parse:'
        }
      } catch (err : any) {
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

export function parse_vectors(vectors : typeof test_data) : TestVector[] {
  const test_vectors = vectors.filter(e => e.length > 1).map(e => {
    const [ inputs, txhex, flags ] = e as TestData
    const vin = inputs.map(e => {
      const [ prev_hash, prev_idx, prev_spk, prev_value ] = e as TestInput
      const script = prev_spk.split(' ')
        .filter(e => !(e.startsWith('0x') && e.length === 4))
        .map(e => e.startsWith('0x') 
          ? e.slice(2)
          : (/^[0-9]+$/.test(e))
            ? parseInt(e)
            : 'OP_' + e
      )
      return create_vin({
        txid: Buff.hex(prev_hash).reverse().hex,
        vout: prev_idx,
        prevout: {
          value: prev_value ?? 0,
          scriptPubKey: script
        },
        sequence: 0xFFFFFFFF
      })
    })

    return {
      txhex,
      inputs : vin,
      flags  : flags.split(',')
    }
  })
  return test_vectors
}