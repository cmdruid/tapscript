import { Test }         from 'tape'
import { get_daemon }   from 'test/core.js'
import { key_spend }    from './taproot/keyspend.test.js'
import { script_spend } from './taproot/tapscript.test.js'
import { tree_spend }   from './taproot/taptree.test.js'
import { inscription }  from './taproot/inscribe.test.js'

const daemon = get_daemon()
const delay  = (ms = 1000) => new Promise(res => setTimeout(res, ms))

export default async function example_tests (t : Test) : Promise<void> {
  const client = await daemon.startup()
  const wallet = await client.load_wallet('test_user')

  t.test('Example Tests', async t => {

    await key_spend(wallet, t)
    await script_spend(wallet, t)
    await tree_spend(wallet, t)

    await inscription(wallet, t)
    await delay()
    await daemon.shutdown()
  })

  // t.teardown(() => daemon.shutdown())
}
