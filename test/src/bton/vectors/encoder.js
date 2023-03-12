export const ecVectors = [
  {
    label: 'P2W-P2PKH -to- P2PKH',
    input: {
      version: 1,
      input: [{
        txid: 'bd9ff5b2f4fcaf8a7cfc7e9b05da5ef6d1ebd795aed1217a5240634b4ba69f02',
        vout: 0,
        scriptSig: [],
        sequence: 0xFFFFFFFF,
        witness: [
          '3045022100c2e5c78bacc2f7243ddadc3a4a943fd6c1d9f04fc1f2fc60bbdbfff5afc3d1bb02204b1bf8c59e5bd9f9e1160012b149188675e0d3bc209e24c0d5ef209889c3567101',
          '03748119e0c0e83d5640d9b2516ea73f2b87106a45adf2f601c23c67bf06beb16b'
        ]
      }],
      output: [
        {
          value: 9765625,
          scriptPubKey: ['OP_DUP', 'OP_HASH160', '63a3c9bbb29995e9984e67f7b627c6916df7a394', 'OP_EQUALVERIFY', 'OP_CHECKSIG']
        },
        {
          value: 9764625,
          scriptPubKey: ['OP_DUP', 'OP_HASH160', 'd05dd5c391436add8410595ce800893443d2dc5c', 'OP_EQUALVERIFY', 'OP_CHECKSIG']
        }
      ],
      locktime: 0
    },
    target: '01000000000101029fa64b4b6340527a21d1ae95d7ebd1f65eda059b7efc7c8aaffcf4b2f59fbd0000000000ffffffff02f9029500000000001976a91463a3c9bbb29995e9984e67f7b627c6916df7a39488ac11ff9400000000001976a914d05dd5c391436add8410595ce800893443d2dc5c88ac02483045022100c2e5c78bacc2f7243ddadc3a4a943fd6c1d9f04fc1f2fc60bbdbfff5afc3d1bb02204b1bf8c59e5bd9f9e1160012b149188675e0d3bc209e24c0d5ef209889c35671012103748119e0c0e83d5640d9b2516ea73f2b87106a45adf2f601c23c67bf06beb16b00000000'
  }
]
