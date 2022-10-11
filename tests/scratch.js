import BTON from '../index.js'

const testTx = {
  txid: 'b69ac9e29175f1448c9803c7bd900e955d7cc8088f0e59448931afd16d31a9f0',
  hash: '49a1ea0c5ddaecea08a4860c15c997af07a794cbcef3fa9682b3c1ed93ad9bf0',
  size: 333,
  bsize: 84,
  msize: 0,
  version: 2,
  vin: [
    {
      prevTxid: 'a8aa280ddebeff7f30970b20cbac2e2ab07e9e638b8a7345b4d6d0abe8ef1e39',
      prevOut: 0,
      scriptSig: { hex: 0, type: null, asm: [], isValidSig: null },
      sequence: {
        // hex: '00000014',
        replaceByFee: true,
        isTimeLocked: true,
        inBlocks: 20
      },
      witness: {
        data: [
          '3044022025bc2c8cc761d89aecdc71d877b845c41567a298fbb78488cff4a1b6c85e2dfd0220428babdcf72b70c693454f586eb3ba370b21fb26d3bb3acb46ee6b03a8b2cbbe01',
          '0342494bd98e54e2c10818f37f0f92bc81d1fcbcc83fc85727dc52deeda18af3b3',
          '0342494bd98e54e2c10818f37f0f92bc81d1fcbcc83fc85727dc52deeda18af3b3'
        ],
        type: 'p2wsh',
        hex: '76a914b02f9adee9acb78a8f0f2b1f656fc934cf07964a87637576a9149c6f23776b78809086a11ac4579af2cb1bd4e75488ac67a91432fbf3c6b2fa111c200fea33264bde518e15d65e87640114b2756876a914af686faf9e5f5b40d41b2a093f9c4f70b1ee5c8488ac68',
        asm: [
          'OP_DUP',
          'OP_HASH160',
          'b02f9adee9acb78a8f0f2b1f656fc934cf07964a',
          'OP_EQUAL',
          'OP_IF',
          'OP_DROP',
          'OP_DUP',
          'OP_HASH160',
          '9c6f23776b78809086a11ac4579af2cb1bd4e754',
          'OP_EQUALVERIFY',
          'OP_CHECKSIG',
          'OP_ELSE',
          'OP_HASH160',
          '32fbf3c6b2fa111c200fea33264bde518e15d65e',
          'OP_EQUAL',
          'OP_NOTIF',
          '14',
          'OP_CHECKSEQUENCEVERIFY',
          'OP_DROP',
          'OP_ENDIF',
          'OP_DUP',
          'OP_HASH160',
          'af686faf9e5f5b40d41b2a093f9c4f70b1ee5c84',
          'OP_EQUALVERIFY',
          'OP_CHECKSIG',
          'OP_ENDIF'
        ],
        hash: '3d13146ee40fb049f094f73f76af06988b5555635e0d61c2650b5327854c009a',
        template: '550144b710770ad02740435a44f8ce427c3b17a0d4bf08a22d54bb42a5a8620d',
        address: 'bcrt1q85f3gmhyp7cynuy57ulhdtcxnz9424trtcxkrsn9pdfj0p2vqzdqzurtpt'
      },
      prevData: null
    }
  ],
  vout: [
    {
      value: 468748000,
      scriptPubkey: {
        hex: '0014d682f3807d840366da194fb6a49f75e01dace411',
        asm: ['OP_0', 'd682f3807d840366da194fb6a49f75e01dace411'],
        type: 'p2wpkh',
        address: 'bcrt1q66p08qrasspkdksef7m2f8m4uqw6eeq34t39yt'
      }
    }
  ],
  locktime: 0,
  meta: {
    name: 'Escrow Contract',
    parties: ['alice', 'bob']
  }
}

const encoded = BTON.encode.tx(testTx)

console.log(encoded)

const decoded = BTON.decode.tx(encoded)

// const decoded = BTON.decode.tx('02000000000101391eefe8abd0d6b445738a8b639e7eb02a2eaccb200b97307fffbede0d28aaa800000000001400000001e086f01b00000000160014d682f3807d840366da194fb6a49f75e01dace41104473044022025bc2c8cc761d89aecdc71d877b845c41567a298fbb78488cff4a1b6c85e2dfd0220428babdcf72b70c693454f586eb3ba370b21fb26d3bb3acb46ee6b03a8b2cbbe01210342494bd98e54e2c10818f37f0f92bc81d1fcbcc83fc85727dc52deeda18af3b3210342494bd98e54e2c10818f37f0f92bc81d1fcbcc83fc85727dc52deeda18af3b36b76a914b02f9adee9acb78a8f0f2b1f656fc934cf07964a87637576a9149c6f23776b78809086a11ac4579af2cb1bd4e75488ac67a91432fbf3c6b2fa111c200fea33264bde518e15d65e87640114b2756876a914af686faf9e5f5b40d41b2a093f9c4f70b1ee5c8488ac6800000000')

console.dir(await decoded, { depth: null })
