import { Buff, Bytes } from '@cmdcode/buff'

import * as check from './check.js'

export function ok (
  value    : unknown,
  message ?: string
) : asserts value {
  if (value === false) {
    throw new Error(message ?? 'Assertion failed!')
  }
}

export function exists <T> (
  value : T | null,
  msg  ?: string
  ) : asserts value is NonNullable<T> {
  if (!check.exists(value)) {
    throw new Error(msg ?? 'Value is null or undefined!')
  }
}

export function is_number (value : unknown) : asserts value is number {
  if (!check.is_number(value)) {
    throw new TypeError(`invalid number: ${String(value)}`)
  }
}

export function is_bigint (value : unknown) : asserts value is bigint {
  if (!check.is_bigint(value)) {
    throw new TypeError(`invalid bigint: ${String(value)}`)
  }
}

export function is_hex (value : unknown) : asserts value is string {
  if (!check.is_hex(value)) {
    throw new TypeError(`invalid hex: ${String(value)}`)
  }
}

export function is_hash (value : unknown, msg ?: string) : asserts value is string {
  if (!check.is_hash(value)) {
    throw new TypeError(msg ?? `invalid hash: ${String(value)}`)
  }
}

export function is_inscription_id (
  id ?: string
) : asserts id is string {
  if (typeof id === 'undefined') {
    throw new Error('inscription id is undefined')
  }
  const is_valid = /^[a-fA-F0-9]{64}i[0-9]+$/.test(id)
  if (!is_valid) throw new Error('invalid inscription id: ' + id)
}

export function is_rune_id (
  id ?: string
) : asserts id is string {
  if (typeof id === 'undefined') {
    throw new Error('rune id is undefined')
  }
  const is_valid = /^[0-9]+\:[0-9]+$/.test(id)
  if (!is_valid) throw new Error('invalid rune id: ' + id)
}

export function is_outpoint (
  outpoint ?: string
) : asserts outpoint is string {
  if (typeof outpoint === 'undefined') {
    throw new Error('outpoint is undefined')
  }
  const is_valid = /^[a-fA-F0-9]{64}:[0-9]+$/.test(outpoint)
  if (!is_valid) throw new Error('invalid outpoint: ' + outpoint)
}

export function is_satpoint (
  satpoint ?: string
) : asserts satpoint is string {
  if (typeof satpoint === 'undefined') {
    throw new Error('satpoint id is undefined')
  }
  const is_valid = /^[a-fA-F0-9]{64}:[0-9]+:[0-9]+$/.test(satpoint)
  if (!is_valid) throw new Error('invalid sat point: ' + satpoint)
}

export function size (input : Bytes, size : number) : void {
  const bytes = Buff.bytes(input)
  if (bytes.length !== size) {
    throw new Error(`Invalid input size: ${bytes.hex} !== ${size}`)
  }
}
