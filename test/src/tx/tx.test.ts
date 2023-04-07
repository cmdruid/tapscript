import { Test } from 'tape'
import { segwit_vector_test } from './segwit/segwit.test.js'

export default function tx_tests(t : Test) : void {
  segwit_vector_test(t)
}

