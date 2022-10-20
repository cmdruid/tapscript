import test from 'tape'
import { webcrypto as crypto } from 'crypto'
import Convert from '../../src/format/convert.js'

const ec = new TextEncoder()
const dc = new TextDecoder()

test('convert.js', t => {
  t.test('string().toString()', t => {
    t.plan(1)
    const str = 'abcdefghijklmnopqrsrtuvwxyz'
    const res = Convert.string(str).toString()
    t.equal(res, str, 'should equal the origin.')
  })

  t.test('hex().tohex()', t => {
    t.plan(1)
    const hex = '0102030405060708090a0b0c0d0e0f'
    const res = Convert.hex(hex).toHex()
    t.equal(res, hex, 'should equal the origin.')
  })

  t.test('number().toNumber()', t => {
    t.plan(1)
    const num = Number.MAX_SAFE_INTEGER
    const res = Convert.number(num).toNumber()
    t.equal(res, num, 'should equal the origin.')
  })

  t.test('bigInt().toBigInt()', t => {
    t.plan(1)
    const big = 123456789876543212345678987654321n
    const res = Convert.bigInt(big).toBigInt()
    t.equal(res, big, 'should equal the origin.')
  })

  t.test('bytes().toBytes()', t => {
    t.plan(1)
    const bytes = crypto.getRandomValues(new Uint8Array(16))
    const res = Convert.bytes(bytes).toBytes()
    t.deepEqual(res, bytes, 'should equal the origin.')
  })

  t.test('bytes().toString()', t => {
    t.plan(1)
    const str = 'abcdefghijklmnopqrsrtuvwxyz'
    const res = Convert.bytes(ec.encode(str)).toString()
    t.equal(res, str, 'should equal the origin.')
  })

  t.test('string().toBytes()', t => {
    t.plan(1)
    const str = 'abcdefghijklmnopqrsrtuvwxyz'
    const res = Convert.string(str).toBytes()
    t.equal(dc.decode(res), str, 'should equal the origin.')
  })

  t.test('Uint16().toBytes()', t => {
    t.plan(1)
    const bytes = crypto.getRandomValues(new Uint16Array(8))
    const res = Convert.bytes(bytes).toBytes()
    t.deepEqual(res, new Uint8Array(bytes), 'should equal the origin.')
  })

  t.test('Uint32().toBytes()', t => {
    t.plan(1)
    const bytes = crypto.getRandomValues(new Uint32Array(4))
    const res = Convert.bytes(bytes).toBytes()
    t.deepEqual(res, new Uint8Array(bytes), 'should equal the origin.')
  })
})
