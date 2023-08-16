import tape from 'tape'

import address_tests  from './src/addr/addr.test.js'
import sig_tests      from './src/sig/sig.test.js'
import tx_tests       from './src/tx/tx.test.js'
import unit_tests     from './src/tap/unit.test.js'
import tweak_test     from './src/tap/tree.test.js'
import example_tests  from './example/ex_test.js'

tape('Tapscript Test Suite', async t => {

  address_tests(t)
  sig_tests(t)
  tx_tests(t)
  tweak_test(t)
  unit_tests(t)
  // example_tests(t)
})
