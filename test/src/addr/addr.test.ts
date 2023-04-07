import { Test }        from 'tape'
import { p2pkh_test }  from './p2pkh.test.js'
import { p2sh_test }   from './p2sh.test.js'
import { p2wpkh_test } from './p2wpkh.test.js'
import { p2wsh_test }  from './p2wsh.test.js'
import { p2tr_test }   from './p2tr.test.js'

export default function address_tests(t : Test) {
  p2pkh_test(t)
  p2sh_test(t)
  p2wpkh_test(t)
  p2wsh_test(t)
  p2tr_test(t)
}