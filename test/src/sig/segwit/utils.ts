import { Buff } from '@cmdcode/buff'
import { InputData } from '../../../../src/index.js'

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
  inputs : InputData
  flags  : string[]
}

export function parseVectors(vectors : any) : TestVector[] {
  const test_vectors = vectors.filter((e : any)  => e.length > 1).map((e : any) => {
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
      return {
        txid: Buff.hex(prev_hash).reverse().hex,
        vout: prev_idx,
        prevout: {
          value: prev_value ?? 0,
          scriptPubKey: script
        },
        sequence: 0xFFFFFFFF
      }
    })

    return {
      txhex,
      inputs : vin,
      flags  : flags.split(',')
    }
  })
  return test_vectors
}