import { convert_33b }   from '@cmdcode/crypto-tools/keys'
import { parse_witness } from '../tx/witness.js'
import { decode_script } from '../script/decode.js'

import {
  Buff,
  Bytes,
  Stream
} from '@cmdcode/buff'

import {
  encode_tapbranch,
  encode_tapleaf
} from './encode.js'

import {
  get_taptweak,
  tweak_pubkey
} from './tweak.js'

import {
  CtrlBlock,
  ScriptData
} from '../../types/index.js'

import * as assert from '../../assert.js'

export function parse_proof (witness : ScriptData[]) {
  const { cblock, params, script } = parse_witness(witness)

  assert.ok(cblock !== null)
  assert.ok(script !== null)

  const cblk   = parse_cblock(cblock)
  const asm    = decode_script(script, true)
  const target = encode_tapleaf(script, cblk.version)

  let branch = Buff.bytes(target).hex

  for (const leaf of cblk.path) {
    branch = encode_tapbranch(branch, leaf)
  }

  const tweak  = get_taptweak(cblk.int_pub, branch)
  const tapkey = tweak_pubkey(cblk.int_pub, tweak).slice(1)

  params.map(e => Buff.bytes(e).hex)

  return { cblock: cblk, params, script: asm, tapkey: tapkey.hex, tweak: tweak.hex }
}

export function parse_cblock (cblock : Bytes) : CtrlBlock {
  const buffer  = new Stream(Buff.bytes(cblock))
  const cbyte   = buffer.read(1).num
  const int_pub = buffer.read(32).hex
  const [ version, parity ] = parse_cbits(cbyte)
  const path = []
  while (buffer.size >= 32) {
    path.push(buffer.read(32).hex)
  }
  if (buffer.size !== 0) {
    throw new Error('Non-empty buffer on control block: ' + String(buffer))
  }
  return { int_pub, path, parity, version }
}

export function parse_cbits (cbits : number) {
  return (cbits % 2 === 0)
    ? [ cbits - 0, 0x02 ]
    : [ cbits - 1, 0x03 ]
}

export function parse_parity (pubkey : Bytes) : number {
  const [ parity ] = convert_33b(pubkey)
  if (parity === 0x02) return 0
  if (parity === 0x03) return 1
  throw new Error('Invalid parity bit: ' + String(parity))
}

export default {
  cbits  : parse_cbits,
  cblock : parse_cblock,
  parity : parse_parity
}
