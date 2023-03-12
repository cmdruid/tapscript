import { Test } from 'tape'
import { Buff } from '@cmdcode/buff-utils'
import * as TAP from '../../../src/lib/tap/script.js'
import test_vectors from './bip.vectors.json' assert { type: 'json' }

interface BipVector {
  tx       : string
  prevouts : string[]
  index    : number
  success  : { scriptSig: string, witness: string[] }
  failure  : { scriptSig: string, witness: string[] }
  flags    : string
  final    : boolean
  comment  : string
}

export async function bip_tests(t : Test) : Promise<void> {
  const vectors = test_vectors as BipVector[]
  for (const vector of vectors.slice(0, 1)) {
    t.test(vector.comment, async t => {
      t.plan(1)
      
    })
  }
  
}
