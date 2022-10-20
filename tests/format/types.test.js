/* eslint-disable key-spacing */
import test from 'tape'

import Type from '../../src/format/types.js'

test('types.js', t => {
  t.test('of(undefined)', t => {
    t.plan(1)
    const val = undefined
    const res = Type.of(val)
    t.equal(res, 'undefined', 'should equal undefined.')
  })

  t.test('of(infinity)', t => {
    t.plan(1)
    const val = Infinity
    const res = Type.of(val)
    t.equal(res, 'infinity', 'should equal infinity.')
  })

  t.test('of(null)', t => {
    t.plan(1)
    const val = null
    const res = Type.of(val)
    t.equal(res, 'null', 'should equal null.')
  })

  t.test('of(hex)', t => {
    t.plan(1)
    const val = '0102030405060708090a0b0c0d0e0f'
    const res = Type.of(val)
    t.equal(res, 'hex', 'should equal hex.')
  })

  t.test('of(bigint)', t => {
    t.plan(1)
    const val = 12345678987654321n
    const res = Type.of(val)
    t.equal(res, 'bigint', 'should equal bigint.')
  })

  t.test('of(number)', t => {
    t.plan(1)
    const val = Number.MAX_SAFE_INTEGER
    const res = Type.of(val)
    t.equal(res, 'number', 'should equal number.')
  })

  t.test('of(array)', t => {
    t.plan(1)
    const val = []
    const res = Type.of(val)
    t.equal(res, 'array', 'should equal array.')
  })

  t.test('of(uint8)', t => {
    t.plan(1)
    const val = new Uint8Array()
    const res = Type.of(val)
    t.equal(res, 'uint8', 'should equal uint8.')
  })

  t.test('of(uint16)', t => {
    t.plan(1)
    const val = new Uint16Array()
    const res = Type.of(val)
    t.equal(res, 'uint16', 'should equal uint16.')
  })

  t.test('of(uint32)', t => {
    t.plan(1)
    const val = new Uint32Array()
    const res = Type.of(val)
    t.equal(res, 'uint32', 'should equal uint32.')
  })

  t.test('of(buffer)', t => {
    t.plan(1)
    const val = new ArrayBuffer()
    const res = Type.of(val)
    t.equal(res, 'buffer', 'should equal buffer.')
  })

  t.test('of(object)', t => {
    t.plan(1)
    const val = {}
    const res = Type.of(val)
    t.equal(res, 'object', 'should equal object')
  })

  t.test('should not equal hex', t => {
    t.plan(1)
    const val = '0102030405060708090a0b0c0d0e0f0j'
    const res = Type.is.hex(val)
    t.notOk(res, 'should not equal hex.')
  })
})
