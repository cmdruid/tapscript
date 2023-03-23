# Tapscript Tools

A basic library for working with Tapscript, Schnorr Signatures, and Bitcoin transactions.

## Introduction

Tapscript uses some pretty cutting-edge stuff. If you are new to tapscript, please continue reading for a brief overview of how tapscript works. The library will make more sense if you have a general idea about what is happening under the hood.

If you already have a good understanding of tapscript, feel free to skip ahead by clicking [here](##-Library-Index)).

## What is Tapscript?

Bitcoin uses a simple scripting language that allows you to lock up coins into a contract. These contracts are published to the blockchain and enforced by all nodes in the network.

In order to settle a contract (and claim its coins), you are required to publish the *entire* contract, including parts that are not relevant to the settlement. This is expensive and wasteful, plus it leaks information that could have otherwise been kept private.

Tapscript is a new way to publish these contracts to the blockchain that fixes the above concerns. It allows you to settle contracts by publishing only the portion of the contract that is relevant. This means smaller transactions, cheaper fees, and better privacy guarantees for the contract as a whole.

Tapscript also comes with many other benefits, including:

 * It drastically simplifies the flow and logic of writing a contract.
 * You can create large, complex contracts that only need a small transaction to settle.
 * Commitments to data and other arbitrary things can be thrown into your contract for free.
 * The new schnorr-based signature format lets you do some crazy cool stuff (BIP340).

These new features came with the Taproot upgrade in 2019. Read more about it [here](https://cointelegraph.com/bitcoin-for-beginners/a-beginners-guide-to-the-bitcoin-taproot-upgrade).

## How does Taproot work?

Taproot uses a simple trick involving something called a "merkle tree".

```
                hash(ab, cd)                  <- Final hash    (the root)
              /             \                
      hash(a, b)             hash(c, d)       <- Combined hash (the branches)
     /          \           /          \    
    hash(a) hash(b)        hash(c) hash(d)    <- Initial hash  (the leaves)
[ script(a), script(b), script(c), script(d) ]  
```

A merkle tree is simply a list of data that is reduced down into a single hash. We do this by hashing items together in pairs of two, repeatedly, until we are naturally left with one item (the root).

The great thing about merkle trees is that you can use the root hash to prove that a piece of data (such as a script) was included somewhere in the tree, without having to reveal the entire tree.

For example, to prove that script(a) exists in the tree, we simply provide hash(b) and hash(c, d). This is all the information we need to recreate the root hash(ab, cd). We do not reveal any of the other scripts.

This allows us to break up a contract into many scripts, then lock coins to the root hash of our combined scripts. To redeem coins, we simply need to provide one of the scripts, plus a 'path' of hashes that let us to recompute the root of the tree.

## About Key Tweaking

Another clever trick that tapscript uses, is something called "key tweaking".

Typically, we create a pair of signing keys by multiplying a secret number with a prime number called a "generator" (G). This process is done in a way that is computationally impossible to reverse without knowing the secret.

```
seckey * G => pubkey
```

We use a special set of numbers when making key-pairs, so that some arithmetic still works between the keys, without breaking their secret relationship with G. This is how we produce signatures and proofs.

```
seckey +    randomkey    +    msg    = signature      <= Does not reveal seckey.
pubkey + (randomkey * G) + (msg * G) = signature * G  <= Proves that seckey was used.
```

Key tweaking is just an extention of this. We use a piece of data to "tweak" both keys in our key-pair, then use the modified keys to sign and verify transactions.

```
seckey +    tweak    =    tweakedkey    = tweakedsec
pubkey + (tweak * G) = (tweakedkey * G) = tweakedpub
```

Later, we can choose to reveal the original public key and tweak, with a proof that both were used to construct the modified key. Or we can simply choose to sign using the modified key, and not reveal anything!

Tapscript uses key tweaking in order to lock coins to the root hash of our script tree. This provides us with two paths for spending coins:

 * Using the tweaked key (without revealing anything).
 * Using the interal key + script + proof.

You can also create tweaked keys using an internal pubkey that has a provably unknown secret key. This is useful for locking coins so that they cannot ever be spent with a tweaked key, and *must* be redeemed using a script!

## Library Index

This library provides a suite of tools for working with scripts, taproot, key tweaking, signatures and transactions. Use the links below to jump to the documentation for a certain tool.

[**Address Tool**](###-Address-Tool)  
Encode, decode, check, and convert various address types.  
[**Script Tool**](###-Script-Tool)  
Encode scripts into hex, or decode into a script array.  
[**Sig Tool**](###-Sig-Tool)  
Produce signatures and validate signed transactions.  
[**Tree Tool**](###-Tree-Tool)  
Build and validate trees of data (and scripts).  
[**Tweak Tool**](###-Tweak-Tool)  
Tweak key-pairs and make commitments to a taproot tree.  
[**Tx Tool**](###-Tx-Tool)  
Encode transactions into hex, or decode into a JSON object.  

### Import

Example import into a browser-based project:

```html
<script src="https://unpkg.com/@cmdcode/tapscript"></script>
<script> const BTON = window.bton </script>
```
Example import into a nodejs-based project:
```ts
import * as Tap from '@cmdcode/tapscript'
```

### Address Tool

This tool allows you to encode, decode, check, an convert various address types.

```ts
Tap.Address = {
  // Work with Pay-to-Pubkey-Hash addresses (Base58 encoded).
  p2pkh : => AddressTool,
  // Work with Pay-to-Script-Hash addresses (Base58 encoded).
  p2sh  : => AddressTool,
  // Work with Pay-to-Witness addresses (Bech32 encoded).
  p2w   : => AddressTool,
  // Work with Pay-to-Taproot addresses (Bech32m encoded).
  p2tr  : => AddressTool
}

interface AddressTool {
  // Check if an address is valid.
  check  : (address : string, network ?: Networks) => boolean
  // Encode a pubkey or script hash into an address.
  encode : (key     : Bytes,  network ?: Networks) => string
  // Decode an address into a pubkey or script hash.
  decode : (address : string, network ?: Networks) => Buff
  // Return the scriptPubKey script for an address type.
  script : (key : string) => string[]
}
```

### Script Tool

This tool helps with parsing / serializing scripts.

```ts
Tap.script = {
  // Encode a JSON formatted script into hex.
  encode : (script : ScriptData, varint = true) => string,
  // Decode a hex formatted script into JSON.
  decode : (script : string) => ScriptData
}
```

### Signature Tool.

This tool helps with signatures and validation.

```ts
Tap.sig.taproot = {
  // Calculate the signature hash for a transaction.
  hash : (
    txdata  : TxData | string | Uint8Array,
    index   : number,
    config  : HashConfig = {}
  ) => Uint8Array,
  // Sign a transaction using your *tweaked* private key.
  sign : (
    prvkey  : string | Uint8Array,
    txdata  : TxData | string | Uint8Array,
    index   : number,
    config  : HashConfig = {}
  ) => Uint8Array,
  // Verify a transaction using the included tapkey (or specify a pubkey).
  verify : (
    txdata  : TxData | string | Uint8Array,
    index   : number,
    config  : HashConfig = {},
    shouldThrow = false
  ) => boolean
}

interface HashConfig {
  extension     ?: Bytes   // Include a tapleaf hash with your signature hash.
  pubkey        ?: Bytes   // Verify using this pubkey instead of the tapkey.
  sigflag       ?: number  // Set the signature type flag.
  separator_pos ?: number  // If using OP_CODESEPARATOR, specify the latest opcode position.
  extflag       ?: number  // Set the extention version flag (future use).
  key_version   ?: number  // Set the key version flag (future use).
}
```

### Tree Tool

This tool helps with creating a tree of scripts / data, plus creating the proofs to validate / spend them.

```ts
Tap.tree = {
  // Returns a 'hashtag' used for padding. Mainly for internal use.
  getTag : (tag : string) => Uint8Array,

  // Returns a 'tapleaf' used for building a tree. 
  getLeaf : (
    data     : string | Uint8Array,
    version ?: number
  ) => string,

  // Returns a 'branch' which combines two leaves (or branches).
  getBranch : (
    leafA : string,
    leafB : string
  ) => string,

  // Returns the root hash of a tree.
  getRoot : (
    leaves : TapTree
  ) => Uint8Array,

  // Returns the 'control block' path needed for validating a tapleaf.
  getPath : (
    pubkey  : string | Uint8Array,
    target  : string,
    taptree : TapTree = [ target ],
    version ?: number 
    parity  ?: 0 | 1  
  ) => string,

  // Checks if a path is valid for a given tapleaf.
  checkPath : (
    tapkey : string | Uint8Array,
    cblock : string | Uint8Array,
    target : string
  ) => boolean,
}
```

### Tweak Tool

This tool helps with tweaking public / secret (private) keys.

```ts
Tap.tweak = {
  // Return a tweaked private key using the provided TapTree.
  getSeckey : (
    seckey : string | Uint8Array,
    leaves : TapTree = []
  ) => string,

  // Return a tweaked public key using the provided TapTree.
  getPubkey : (
  pubkey : string | Uint8Array,
  leaves : TapTree = []
) : TapKey,

  // Return a 'taptweak' which is used for key tweaking.
  getTweak : (
    pubkey : string | Uint8Array,
    tweak  : string | Uint8Array
  ) => Uint8Array,

  // Return a tweaked secret key using the provided tweak.
  tweakSeckey : (
    prvkey : string | Uint8Array,
    tweak  : string | Uint8Array
  ) => Uint8Array,

  // Return a tweaked public key using the provided tweak.
  tweakPubkey : (
    pubkey : string | Uint8Array,
    tweak  : string | Uint8Array
  ) => Uint8Array
}

// A tree is an array of leaves, formatted as strings.
// These arrays can also be nested in multiple layers.
type TapTree = Array<string | string[]>

type TapKey = [
  tapkey : string,  // The tweaked public key.
  parity : number   // 0 or 1 depending on whether the key was even / odd.
]

```

### Tx Tool

This tool helps with parsing / serializing transaction data.

```ts
Tap.tx = {
  // Serializes a JSON transaction into a hex-encoded string.
  encode : (
    txdata       : TxData,  // The transaction JSON.
    omitWitness ?: boolean  // If you wish to omit the witness data.
  ) => string,

  // Parses a hex-encoded transaction into a JSON object.
  decode : (
    bytes : string | Uint8Array
  ) => TxData
}

interface TxData {
  version  : number           // The transaction verion.
  input    : InputData[]      // Ann array of transaction inputs.
  output   : OutputData[]     // An array of transaction outputs.
  locktime : LockData         // The locktime of the transaction.
}

interface InputData {
  txid : string               // The txid of the UTXO being spent.
  vout : number               // The output index of the UTXO being spent.
  prevout   ?: OutputData     // The output data of the UTXO being spent.
  scriptSig ?: ScriptData     // The ScriptSig field (mostly deprecated).
  sequence  ?: SequenceData   // The sequence field for the input.
  witness   ?: WitnessData    // An array of witness data for the input.
}

interface OutputData {
  value : number | bigint     // The satoshi value of the output.
  scriptPubKey ?: ScriptData  // The locking script data.
  address      ?: string      // (optional) provide a locking script
}                             // that is encoded as an address.

type SequenceData = string | number
type ScriptData   = Bytes  | WordArray
type WitnessData  = ScriptData[]
type LockData     = number
type WordArray    = Word[]
type Word         = string | number | Uint8Array
type Bytes        = string | Uint8Array
```

## Examples

Here are a few examples to help demonstrate using the library. Please feel free to contribute more!

### Transaction Object

This is an example transaction in JSON format.

```ts
const txdata = {
  version : 2
  input: [
    {
      txid     : '1351f611fa0ae6124d0f55c625ae5c929ca09ae93f9e88656a4a82d160d99052',
      vout     : 0,
      prevout  : { 
        value: 10000,
        scriptPubkey: '512005a18fccd1909f3317e4dd7f11257e4428884902b1c7466c34e7f490e0e627da'
        
      },
      sequence : 0xfffffffd,
      witness  : []
    }
  ],
  output : [
    { 
      value: 9000, 
      address: 'bcrt1pqksclnx3jz0nx9lym4l3zft7gs5gsjgzk8r5vmp5ul6fpc8xyldqaxu8ys'
    }
  ],
  locktime: 0
}
```

### Create / Publish an Inscription

Creating an inscription is a three-step process:
 1. We create a script for publishing the inscription, and convert it into a bitcoin address.
 2. Send funds to the bitcoin address.
 3. Create a redeem transaction, which claims the previous funds (and publishes the data).

```ts
import { Address, Script, Tree, Tweak, Tx } from '@cmdcode/tapscript'

/** 
 * Creating an Inscription. 
 */

// Provide your secret key.
const seckey = 'your secret key (in bytes)'
// There's a helper method to derive your pubkey.
const pubkey = 'your public key (in bytes)'

// We have to provide the 'ord' marker,
// a mimetype for the data, and the blob
// of data itself (as hex or a Uint8Array).
const marker   = ec.encode('ord')        // The 'ord' marker.
const mimetype = ec.encode('image/png')  // The mimetype of the file.
const imgdata  = getFile('image.png')    // Fake method that fetches the file (and returns bytes). 

const script   = [
  // A basic "inscription" script. The encoder will also 
  // break up data blobs and use 'OP_PUSHDATA' when needed.
  pubkey, 'OP_CHECKSIG', 'OP_0', 'OP_IF', marker, '01', mimetype, 'OP_0', imgdata, 'OP_ENDIF'
]

// Convert the script into a tapleaf.
const tapleaf    = await Tree.getLeaf(Script.encode(script))
// Pass your pubkey and your leaf in order to get the tweaked pubkey.
const [ tapkey ] = await Tweak.getPubkey(pubkey, [ leaf ])
// Encode the tweaked pubkey as a bech32m taproot address.
const address    = Address.P2TR.encode(tapkey)

// Once you send funds to this address, please make a note of 
// the transaction's txid, and vout index for this address.
console.log('Your taproot address:', address)

/** 
 * Publishing an Inscription. 
 */

// Get the 'cblock' string (which is the proof used to verify the leaf is in the tree).
const cblock = await Tree.getPath(pubkey, tapleaf)

// Construct our redeem transaction.
const txdata = {
  version : 2
  input: [
    {
      txid     : 'replace with the txid of your previous transaction.',
      vout     : 'replace with the vout index spending to the previous address.',
      prevout  : {
        value: 'replace with the amount sent to this address from the previous transaction',
        address: address
      },
      sequence : 0xfffffffd,
      witness  : []
    }
  ],
  output : [
    { 
      value: 'replace with the amount sent from the previous transaction, minus fees (for the miners)', 
      address: 'replace with an address of your choice!'
    }
  ],
  locktime: 0
}

// Create a signature for our transaction (and commit to the tapleaf we are using).
const sig = Sig.taproot.sign(prvkey, txdata, 0, { extension: tapleaf })

// Set our witness data to include the signature, the spending script, and the proof (cblock).
txdata[0].witness = [ sig, script, cblock ]

// Encode the transaction as a hex string.
const txhex = Tx.encode(txdata)

// Output our transaction data to console.
console.log('Your transaction:', txdata)
console.log('Your raw transaction hex:', txhex)

// You can publish your transaction data using 'sendrawtransaction' in Bitcoin Core, or you 
// can use an external API (such as https://mempool.space/docs/api/rest#post-transaction).
```

More examples to come!

## Development / Testing

This library uses yarn for package management, tape for writing tests, and rollup for bundling cross-platform compatible code. Here are a few scripts that are useful for development.

```bash
## Compiles types and builds release candidates in /dist folder.
yarn build
## Run any typescript file using real-time compilation.
yarn start contrib/example.ts
## Runs all tests listed in test/tape.ts 
yarn test
## Full macro script for generating a new release candidate.
yarn release
```

## Bugs / Issues

If you run into any bugs or have any questions, please submit an issue ticket.

## Contribution

Feel free to fork and make contributions. Suggestions are welcome!

## Future Roadmap

 - Add signature and validation for ecdsa (segwit and earlier).
 - Refactor and stress-test tree compilation with many (many) leaves.
 - Allow arbitrary ordering of tree elements.
 - Write more unit and vector tests (cover all the things).

## Dependencies

This library contains minimal dependencies.  

**Buff-Utils**  
A swiss-army-knife of byte manipulation tools.
https://github.com/cmdruid/buff-utils

**Crypto-Utils**  
User-friendly cryptography tools.  
https://github.com/cmdruid/crypto-utils

## Resources  

**BIP340 Wiki Page**  
This BIP covers schnorr signatures and verification.  
https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki

**BIP341 Wiki Page**  
This BIP covers the construction of trees, signature hashes, and proofs.  
https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki

**BIP342 Wiki Page**  
This BIP covers changes to opcodes and signature verification.  
https://github.com/bitcoin/bips/blob/master/bip-0342.mediawiki

**Tapscript example using Tap**  
This is a guide to using a command-line tool called Tap. It's very useful  
for creating taproot transactions and to debug any issues with this library!  
https://github.com/bitcoin-core/btcdeb/blob/master/doc/tapscript-example-with-tap.md

## License

Use this library however you want!

## Contact

You can find me on twitter at `@btctechsupport` or on nostr at `npub1gg5uy8cpqx4u8wj9yvlpwm5ht757vudmrzn8y27lwunt5f2ytlusklulq3`