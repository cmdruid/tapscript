import test from 'tape'
import { test160 } from '../../src/crypto/ripemd160.js'

test('ripemd.js', t => {
  t.test('Run test160', t => {
    t.plan(1)
    t.ok(test160(), 'should pass all test vectors.')
  })
})
