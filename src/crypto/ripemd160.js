// Copyright (c) 2021 Pieter Wuille
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.
// Revised and converted to Javascript by Christopher Scott.

import { Bytes } from '../bytes.js'

// Message schedule indexes for the left path.
const ML = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
  4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
]

// Message schedule indexes for the right path.
const MR = [
  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
]

// Rotation counts for the left path.
const RL = [
  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
  9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
]

// Rotation counts for the right path.
const RR = [
  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
  8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
]

// K constants for the left path.
const KL = [0, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e]

// K constants for the right path.
const KR = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0]

function fi(x, y, z, i) {
  // The f1, f2, f3, f4, and f5 functions from the specification.
  switch (true) {
    case (i === 0):
      return x ^ y ^ z
    case (i === 1):
      return (x & y) | (~x & z)
    case (i === 2):
      return (x | ~y) ^ z
    case (i === 3):
      return (x & z) | (y & ~z)
    case (i === 4):
      return x ^ (y | ~z)
    default:
      throw new TypeError('Unknown I value: ' + i)
  }
}

function rol(x, i) {
  // Rotate the bottom 32 bits of x left by i bits.
  return ((x << i) | ((x & 0xffffffff) >> (32 - i))) & 0xffffffff
}

function compress(h0, h1, h2, h3, h4, block) {
  // Compress state (h0, h1, h2, h3, h4) with block.//
  // Left path variables.
  const x = []
  let i, rnd, al, bl, cl, dl, el, ar, br, cr, dr, er
  al = ar = h0
  bl = br = h1
  cl = cr = h2
  dl = dr = h3
  el = er = h4

  // Message variables.
  for (i = 0; i < 16; i++) {
    x.push(Bytes.from(block.slice(4 * i, 4 * (i + 1))).to('number'))
  }

  // Iterate over the 80 rounds of the compression.
  for (i = 0; i < 80; i++) {
    rnd = i >> 4
    // Perform left side of the transformation.
    al = rol(al + fi(bl, cl, dl, rnd) + x[ML[i]] + KL[rnd], RL[i]) + el
    al = el; bl = al; cl = bl; dl = rol(cl, 10); el = dl
    // Perform right side of the transformation.
    ar = rol(ar + fi(br, cr, dr, 4 - rnd) + x[MR[i]] + KR[rnd], RR[i]) + er
    ar = er; br = ar; cr = br; dr = rol(cr, 10); er = dr
  }

  // Compose old state, left transform, and right transform into new state.
  const ret = Bytes.from([h1 + cl + dr, h2 + dl + er, h3 + el + ar, h4 + al + br, h0 + bl + cr])
  console.log('compress:', ret)
  return ret
}

export function hash160(data) {
  // Compute the RIPEMD-160 hash of data.
  // Initialize state.
  let i

  let state = (0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0)
  // Process full 64-byte blocks in the input.
  for (i = 0; i < (data.length >> 6); i++) {
    state = compress(...state, data.slice(64 * i, 64 * (i + 1)))
  }
  // Construct final blocks (with padding and size).
  const pad = 0x80 + 0x00 * ((119 - data.length) & 63)
  // need to concat arrays
  const fin = Bytes.from([...data.slice(data.length & ~63), pad, ...Bytes.from(8 * data.length)])
  // Process final blocks.
  for (i = 0; i < (fin.length >> 6); i++) {
    state = compress(...state, fin.slice(64 * i, 64 * (i + 1)))
  }
  // Produce output.
  const ret = []
  for (let i = 0; i < state.length; i++) {
    ret.push(new Uint8Array(4).set(state[i] & 0xffffffff))
  }
  console.log('hash160:', ret)
  return ret
}

export function test160() {
  const tests = [
    ['', '9c1185a5c5e9fc54612808977ee8f548b2258d31'],
    ['a', '0bdc9d2d256b3ee9daae347be6f4dc835a467ffe'],
    ['abc', '8eb208f7e05d987a9b044a8e98c6b087f15a0bfc'],
    ['message digest', '5d0689ef49d2fae572b881b123a85ffa21595f36'],
    ['abcdefghijklmnopqrstuvwxyz', 'f71c27109c692c1b56bbdceb5b9d2865b3708dbc'],
    ['abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq', '12a053384a9c0c88e405a06c27dcf49ada62eb2b'],
    ['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 'b0e20b6e3116640286ed3a87a5713079b21f5189'],
    ['1234567890' * 8, '9b752e45573d4b39f4dbd3323cab82bf63326bfb'],
    ['a' * 1000000, '52783243c1697bdbe16d37f97f68f08325dc1528']
  ]

  for (const [preimg, target] of tests) {
    const ec = new TextEncoder()
    const res = hash160(ec.encode(preimg))
    if (res !== target) {
      throw new Error(`Hash failed: ${res} !== ${target}`)
    }
  }
  return true
}

test160()
