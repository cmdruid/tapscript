import { Test } from 'tape'
import { key_spend }    from './taproot/key_spend.js'
import { script_spend } from './taproot/script_spend.js'
import { tree_spend }   from './taproot/tree_spend.js'

export default async function example_tests (t : Test) : Promise<void> {
  t.test('Example Tests', async t => {
    await key_spend(t)
    await script_spend(t)
    await tree_spend(t)
  })
}