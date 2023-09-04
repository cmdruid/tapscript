# Tapscript

A basic library for working with Taproot, Schnorr Signatures, and Bitcoin transactions.

> Note: For nodejs users, please upgrade to version 19+ for globalThis support.

## Introduction

This library utilizes the latest feature upgrade to Bitcoin called Taproot. If you are new to Bitcoin or the Taproot upgrade, please continue reading for a brief overview of how it works. This library will be easier to follow if you know what taproot is doing under the hood.

If you already have a good understanding of Bitcoin and Taproot, feel free to skip ahead by clicking [here](#tool-index).

## What is Taproot?

Bitcoin uses a simple scripting language (called Bitcoin Script) that allows you to lock up coins into a contract. These contracts are published to the blockchain and enforced by all nodes in the network.

In order to settle a contract (and claim its coins), you are required to publish the *entire* contract script, including parts that are not relevant to the settlement. This is expensive and wasteful, plus it leaks information that could have otherwise been kept private.

Taproot is a new way to publish these contracts to the blockchain that fixes the above concerns. It allows you to settle contracts by publishing only the portion of the contract script that is relevant. This means smaller transactions, cheaper fees, and better privacy guarantees for the contract as a whole.

Taproot also comes with many other benefits, including:

 * It drastically simplifies the flow and logic of writing a contract.
 * You can create large, complex contracts that only require a small transaction to settle.
 * Commitments to data and other arbitrary things can be thrown into your contract for free.
 * The new schnorr-based method for digital signatures (BIP340) lets you do some crazy cool stuff, like combining the signatures from a group of signers (BIP327).

You can read more about the Taproot upgrade in 2019 [here](https://cointelegraph.com/bitcoin-for-beginners/a-beginners-guide-to-the-bitcoin-taproot-upgrade).

## How does Taproot work?

Taproot uses a simple trick involving a tree-like data structure called a 'merkle tree':

```
                hash(ab, cd)                <- Final hash    (the root)
              /             \                
     hash(a, b)             hash(c, d)      <- Combined hash (the branches)
    /          \           /          \    
  hash(a) hash(b)        hash(c) hash(d)    <- Initial hash  (the leaves)

[ script_a, script_b, script_c, script_d ]  <- array of spending scripts
```

A merkle tree is quite simply a list of data that is reduced down into a single hash value. We do this by hashing values together in pairs of two, repeatedly, until we are naturally left with one value (the root).

The great thing about merkle trees is that you can use the root and branch hashes to prove that a piece of data is included within the tree, without having to reveal the entire tree.

For example, to prove that script_a exists in the tree, we provide the script with hash(b) and hash(c, d). This is all the information we need to recreate the root hash(ab, cd). We do not reveal any of the other scripts.

This allows us to break up a contract into many scripts, then lock the coins to the 'root' hash of our script tree. When redeeming coins, we provide a script with a solution, plus the 'path' of hashes needed to recompute the root hash and prove our script exists within the tree.

## About Key Tweaking

In order to lock our coins to a 'root' hash, Taproot uses another clever trick called "key tweaking".

When we go about creating a key-pair, we start with picking a large number as our secret key. We combine this number with a known constant (G), using a a formula (ec) that is computationally impossible to reverse. The resulting number is our public key.

```
ec(seckey, G) => pubkey
```

The elliptic curve formula also allows us to perform arithmetic between the keys, without breaking their secret relationship. This is how we produce signatures and proofs.

```
seckey +    random     +    msg     = sig         <= Safe to reveal, hides seckey.
pubkey + ec(random, G) + ec(msg, G) = ec(sig, G)  <= Proves that seckey was used.
```

Key tweaking simply adds more arithmetic to the process. We can 'tweak' both keys with an extra value, then use the tweaked keys to produce a signature.

```
seckey +    tweak     = tweaked_seckey
pubkey + ec(tweak, G) = tweaked_pubkey
```

Later, we can choose to reveal the original public key and tweak, as proof that both were used to construct the modified key. Or we can simply choose to sign using the modified key, without revealing that a tweak was made!

Taproot uses key tweaking in order to lock coins to our pubkey + root of our tree. This provides us with two paths for spending coins:

 * Using the tweaked pubkey (without revealing anything).
 * Using the interal pubkey + script + proof.

If you want to eliminate the key-spending path (so that a script *must* be used to redeem funds), you can replace the pubkey with a random number. However, it is best to use a number that everyone can verify has an unknown secret key. One example of such a number is the following:

```js
// BIP0341 specifies using the following pubkey value for script-only contracts.
// It is created by hashing the DER encoded coordinates of secp256k1 base point G:
'0250929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0'
// Since this pubkey was generated using a hash function, there is no feasible way 
// to compute what the matching private key would be.
```

## Tool Index

This library provides a suite of tools for working with Bitcoin addresses, scripts, taproot tweaks, signatures and transactions. Use the links below to jump to the documentation for a certain tool.

[**Address Tool**](#address-tool)  
Encode, decode, check, and convert various address types.  
[**Script Tool**](#script-tool)  
Encode scripts into hex, or decode into a script array.  
[**SigHash Tool**](#signer-tool)  
Create the hash and signature needed for unlocking funds, plus validate signed transactions.  
[**Tap Tool**](#tap-tool)  
Build, tweak, and validate trees of bitcoin scripts (plus other data).  
[**Tx Tool**](#tx-tool)  
Encode transactions into hex, or decode them into a rich JSON object.

### About Buff

This library makes heavy use of the [Buff](https://github.com/cmdruid/buff-utils) tool for converting between data types. Buff is an extention of the Uint8Array type, so all Buff objects can naturally be treated as Uint8Array objects. Buff objects however incude an extensive API for converting into different types (*for ex: buff.hex for hex strings*). Please check the above link for more information on how to use Buff.

### Import

Example import into a browser-based project:
```html
<script src="https://unpkg.com/@cmdcode/tapscript"></script>
<script> const { Address, Script, SigHash, Tap, Tx } = window.tapscript </script>
```
Example import into a commonjs project:
```ts
const { Address, Script, SigHash, Tap, Tx } = require('@cmdcode/tapscript')
```
Example import into an ES module project:
```ts
import { Address, Script, SigHash, Tap, Tx } from '@cmdcode/tapscript'
```

### Address Tool

This tool allows you to encode, decode, check, an convert various address types.

```ts
Address = {
  // Work with Pay-to-Pubkey-Hash addresses (Base58 encoded).
  P2PKH  : => AddressTool,
  // Work with Pay-to-Script-Hash addresses (Base58 encoded).
  P2SH   : => AddressTool,
  // Work with Pay-to-Witness PubKey-Hash addresses (Bech32 encoded).
  P2WPKH : => AddressTool,
  // Work with Pay-to-Witness Script-Hash addresses (Bech32 encoded).
  P2WSH  : => AddressTool,
  // Work with Pay-to-Taproot addresses (Bech32m encoded).
  P2TR   : => AddressTool,
  // Decode any address format into a data-rich object.
  parse : (address : string) => AddressData,
  // Convert a scriptPubKey output into an address.
  from_script : (address : string, network ?: Network) => string
}

interface AddressTool {
  // Check if an address is valid.
  check  : (address : string, network ?: Networks) => boolean
  // Decode an address into a pubkey hash or script hash.
  decode : (address : string, network ?: Networks) => Buff
  // Convert a key or script into the proper hash.
  hash   : (input : Bytes | ScriptData) => Buff
  // Encode a pubkey hash or script hash into an address.
  encode : (input : Bytes,  network ?: Networks) => string
  // Return the scriptPubKey script for an address type.
  scriptPubKey : (input : string) => string[]
  // Return an address based on a public key (PKH type addresses only).
  fromPubKey : (pubkey : Bytes, network ?: Networks) => string
  // Return an address based on a script key (SH type addresses only).
  fromScript : (script : ScriptData, network ?: Networks) => string
}

interface AddressData {
  data    : Buff
  network : Networks
  prefix  : string
  script  : string[]
  type    : keyof AddressTools
}

type Networks = 'bitcoin' | 'testnet' | 'regtest'
```

#### Examples

Example of using the `Address` tool.

```ts
const address = 'bcrt1q738hdjlatdx9xmg3679kwq9cwd7fa2c84my9zk'
// You can decode any address, extract data, or convert to a scriptPubKey format.
const decoded = Address.parse(address)
// Example of the decoded data object.
{ 
  prefix  : 'bcrt1q',
  type    : 'p2w',
  network : 'regtest',
  data    : Buff('f44f76cbfd5b4c536d11d78b6700b8737c9eab07'),
  script  : [ 'OP_0', 'f44f76cbfd5b4c536d11d78b6700b8737c9eab07' ]
}
// You can also quickly convert between address and scriptPubKey formats.
const data = Address.parse(address)
// Bytes: 0014f44f76cbfd5b4c536d11d78b6700b8737c9eab07
const address = Address.from_script(script)
// Address : bcrt1q738hdjlatdx9xmg3679kwq9cwd7fa2c84my9zk
```

Example of using the AddressTool API for a given address type.

```ts
// Example 33-byte public key.
const pubkey  = '03d5af2a3e89cb72ff9ca1b36091ca46e4d4399abc5574b13d3e56bca6c0784679'
// You can encode / decode / convert keys and script hashes.
const address = Address.p2wpkh.fromPubKey(pubkey, 'regtest')
// Address: bcrt1q738hdjlatdx9xmg3679kwq9cwd7fa2c84my9zk
const address = Address.p2wpkh.encode(keyhash, 'regtest')
// Address: bcrt1q738hdjlatdx9xmg3679kwq9cwd7fa2c84my9zk
const bytes   = Address.p2wpkh.decode(address)
// KeyHash: f44f76cbfd5b4c536d11d78b6700b8737c9eab07
const script  = Address.p2wpkh.scriptPubKey(bytes)
// script: script: [ 'OP_0', 'f44f76cbfd5b4c536d11d78b6700b8737c9eab07' ]
```

### Script Tool

This tool helps with parsing / serializing scripts.

```ts
Script = {
  // Encode a JSON formatted script into hex.
  encode : (script : ScriptData, varint = true) => string,
  // Decode a hex formatted script into JSON.
  decode : (script : string, varint = false)    => ScriptData
  // Normalize script / data to a particular format:
  fmt : {
    // Convert script to opcodes / hex data (asm format).
    toAsm()   => string[]  (asm format).
    // Convert script to bytes (script hex).
    toBytes() => Buff
     // Convert non-script witness data to bytes.
    toParam() => Buff  
  }
}
```

### Signer Tool.

This tool helps with signatures and validation.

```ts
Signer.taproot = {
  // Calculate the signature hash for a transaction.
  hash : (
    txdata  : TxData | Bytes,
    index   : number,
    config  : HashConfig = {}
  ) => Uint8Array,
  // Sign a transaction using your *tweaked* private key.
  sign : (
    seckey  : Bytes,
    txdata  : TxData | Bytes,
    index   : number,
    config  : HashConfig = {}
  ) => Uint8Array,
  // Verify a transaction using the included tapkey (or specify a pubkey).
  verify : (
    txdata  : TxData | Bytes,
    index   : number,
    config  : HashConfig = {}
  ) => boolean
}

interface HashConfig {
  extension     ?: Bytes    // Hash and sign using this tapleaf.
  pubkey        ?: Bytes    // Verify using this pubkey instead of the tapkey.
  script        ?: Bytes    // Hash and sign using this script (for segwit spends).
  sigflag       ?: number   // Set the signature type flag.
  separator_pos ?: number   // If using OP_CODESEPARATOR, specify the latest opcode position.
  extflag       ?: number   // Set the extention version flag (future use).
  key_version   ?: number   // Set the key version flag (future use).
  throws        ?: boolean  // Should throw an exception on failure.
}
```

#### Example

Example of a basic pay-to-taproot key spend (similar to pay-to-pubkey):

```ts
// Sample secret / public key pair.
const seckey  = '730fff80e1413068a05b57d6a58261f07551163369787f349438ea38ca80fac6'
const pubkey  = '0307b8ae49ac90a048e9b53357a2354b3334e9c8bee813ecb98e99a7e07e8c3ba3'

// For key-spends, we need to tweak both the secret key and public key.
const [ tseckey ] = Tap.getSecKey(seckey)
const [ tpubkey ] = Tap.getPubKey(pubkey)

// Our taproot address is the encoded version of our public tapkey.
const address = Address.p2tr.encode(tpubkey, 'regtest')

// NOTE: For the next step, you need to send 100_000 sats to the above address.
// Make note of the txid of this transaction, plus the index of the output that
// you are spending.

const txdata = Tx.create({
  vin  : [{
    // The txid of your funding transaction.
    txid: 'fbde7872cc1aca4bc93ac9a923f14c3355b4216cac3f43b91663ede7a929471b',
    // The index of the output you are spending.
    vout: 0,
    // For Taproot, we need to specify this data when signing.
    prevout: {
      // The value of the output we are spending.
      value: 100000,
      // This is the script that our taproot address decodes into.
      scriptPubKey: [ 'OP_1', tpubkey ]
    },
  }],
  vout : [{
    // We are locking up 99_000 sats (minus 1000 sats for fees.)
    value: 99000,
    // We are locking up funds to this address.
    scriptPubKey: Address.toScriptPubKey('bcrt1q6zpf4gefu4ckuud3pjch563nm7x27u4ruahz3y')
  }]
})

// For this example, we are signing for input 0.

// Provide your tweaked secret key with the transaction, 
// plus the index # of the input you are signing for.
const sig = Signer.taproot.sign(tseckey, txdata, 0)

// Add your signature to the witness data for that input.
txdata.vin[0].witness = [ sig ]

// For verification, provided your 
await Signer.taproot.verify(txdata, 0, { throws: true })

console.log('Your address:', address)
console.log('Your txhex:', Tx.encode(txdata).hex)
```

You can find more examples in the main **Examples** section further down.

> Note: There is also an identical `Signer.segwit` tool for signing and validating segwit (BIP0143) transactions. The segwit signer currently does not support the use of OP_CODESEAPRATOR. Any scripts containing this opcode will throw an exception by default.

### Tap Tool

```ts
Tap = {
  // Returns the tweaked public key (and cblock) for a given tree (and target).
  getPubKey    : (pubkey : Bytes, config ?: TapConfig)  => TapKey,
  // Returns the tweaked secret key (and cblock) for a given tree (and target).
  getSecKey    : (seckey : Bytes, config ?: TapConfig)  => TapKey,
  // Converts a script into a tapleaf (for script-based spending).
  encodeScript : (script: ScriptData, version?: number) => string,
  // Checks the validity of a given leaf target and control block.
  checkPath    : (  
    tapkey : Bytes, 
    target : Bytes, 
    cblock : Bytes, 
    config ?: TapConfig  
  ) => boolean,  
  // Gives access to the various sub-tools (described below).
  tree  : TreeTool,
  tweak : TweakTool,
  util  : UtilTool
}

interface TapConfig {
  isPrivate ?: boolean
  target    ?: Bytes
  tree      ?: TapTree
  throws    ?: boolean
  version   ?: number
}

type TapKey = [
  tapkey : string,  // The tweaked public key.
  cblock : string   // The control block needed for spending the tapleaf target.
]
```

#### Examples

Example of tapping a key with no scripts (key-spend).

```ts
const [ tapkey ] = Tap.getPubKey(pubkey)
```

Example of tapping a key with a single script and returning a proof.

```ts
// Encode the script as bytes.
const bytes = Script.encode([ 'script' ])
// Convert the bytes into a tapleaf.
const target = Tap.tree.getLeaf(bytes)
// Provide the tapleaf as a target for generating the proof.
const [ tapkey, cblock ] = Tap.getPubKey(pubkey, { target })
```

Example of tapping a key with many scripts.

```ts
const scripts = [
  [ 'scripta' ],
  [ 'scriptb' ],
  [ 'scriptc' ]
]

// Convert the scripts into an array of tap leaves.
const tree = scripts
  .map(e => Script.encode(e))
  .map(e => Tap.tree.getLeaf(e))

// Optional: You can also add data to the tree.
const bytes = encodeData('some data')
const leaf  = Tap.tree.getLeaf(bytes)
tree.push(leaf)

// Select a target leaf for generating the proof.
const target = tree[0]

// Provide the tree and target leaf as arguments.
const [ tapkey, cblock ] = Tap.getPubKey(pubkey, { tree, target })
```

### Tree Tool

This tool helps with creating a tree of scripts / data, plus the proofs to validate items in the tree.

```ts
Tap.tree = {
  // Returns a 'hashtag' used for padding. Mainly for internal use.
  getTag    : (tag : string) => Buff,
  // Returns a 'tapleaf' used for building a tree. 
  getLeaf   : (data : Bytes, version ?: number) => string,
  // Returns a 'branch' which combines two leaves (or branches).
  getBranch : (leafA : string, leafB : string) => string,
  // Returns the root hash of a tree.
  getRoot   : (leaves : TapTree) => Buff,
}

// A tree is an array of leaves, formatted as strings.
// These arrays can also be nested in multiple layers.
type TapTree = Array<string | string[]>
```

### Tweak Tool

This tool helps with tweaking public / secret (private) keys.

```ts
Tap.tweak = {
  // Return a tweaked private key using the provided raw data.
  getSeckey   : (seckey: Bytes, data ?: Bytes | undefined) => Buff,
  // Return a tweaked public key using the provided raw data.
  getPubkey   : (pubkey: Bytes, data ?: Bytes | undefined) => Buff,
  // Return a 'taptweak' which is used for key tweaking.
  getTweak    : (key : Bytes, data ?: Bytes, isPrivate ?: boolean) => Buff,
  // Return a tweaked secret key using the provided tweak.
  tweakSeckey : (seckey: Bytes, tweak: Bytes) => Buff,
  // Return a tweaked public key using the provided tweak.
  tweakPubkey : (seckey: Bytes, tweak: Bytes) => Buff
}
```

### Util Tool

This tool provides helper methods for reading and parsing data related to taproot.

```ts
Tap.util = {
  readCtrlBlock : (cblock : Bytes) => CtrlBlock,
  readParityBit : (parity ?: string | number) => number
}

interface CtrlBlock {
  version : number
  parity  : number
  intkey  : Buff
  paths   : string[]
}
```

#### Example

```ts
const cblock = 'c1187791b6f712a8ea41c8ecdd0ee77fab3e85263b37e1ec18a3651926b3a6cf27'
const { intkey, parity, paths, version } = Tap.util.readCtrlBlock(cblock)
// Expected output, with key formatted as hex instead of bytes (for readability).
{
  intkey: '187791b6f712a8ea41c8ecdd0ee77fab3e85263b37e1ec18a3651926b3a6cf27',
  parity: 3,
  paths: [],
  version: 192
}
```

### Tx Tool

This tool helps with parsing / serializing transaction data.

```ts
Tx = {
  // Create a transaction object from partial JSON. 
  // Any missing fields will be repalced with default values.
  create : (data : Partial<TxData>) => TxData,
  // Serialize a JSON transaction into a hex-encoded string.
  encode : (
    txdata       : TxData,  // The transaction JSON.
    omitWitness ?: boolean  // If you wish to omit the witness data.
  ) => string,
  // Parse a hex-encoded transaction into a JSON object.
  decode : (bytes : string | Uint8Array) => TxData,
  // Normalize transaction data to a particular format.
  fmt : {
    // Convert transaction data into JSON format.
    toJson  : (txdata ?: TxData | Bytes) => TxData,
    // Convert transaction data into a byte format.
    toBytes : (txdata ?: TxData | Bytes) => Buff
  },
  util : {
    // Get the transaction Id of a transaction.
    getTxid : (txdata : TxData | Bytes) => Buff,
    // Get the size data of a transaction.
    getTxSize : (txdata : TxData | Bytes) => TxSizeData,
    // Parse a scriptPubKey and get the type plus hash data.
    readScriptPubKey : (script : ScriptData) => ScriptPubKeyData,
    // Parse an array of witness data into named values.
    readWitness : (witness : ScriptData[])  => WitnessData
  }
}

interface TxData {
  version  ?: number           // The transaction verion. Defaults to version 2.
  vin       : InputData[]      // An array of transaction inputs.
  vout      : OutputData[]     // An array of transaction outputs.
  locktime ?: LockData         // The locktime of the transaction. Defautls to 0.
}

interface InputData {
  txid : string               // The txid of the UTXO being spent.
  vout : number               // The output index of the UTXO being spent.
  prevout   ?: OutputData     // The output data of the UTXO being spent.
  scriptSig ?: ScriptData     // The ScriptSig field (mostly deprecated).
  sequence  ?: SequenceData   // The sequence field for the input.
  witness   ?: ScriptData[]   // An array of witness data for the input.
}

interface OutputData {
  value : number | bigint     // The satoshi value of the output.
  scriptPubKey : ScriptData   // The locking script data.
}

export interface ScriptPubKeyData {
  type : OutputType
  data : Buff
}

interface WitnessData {
  annex  : Buff | null  // The annex data (if present) or null.
  cblock : Buff | null  // The control block (if present) or null.
  script : Buff | null  // The redeem script (if present) or null.
  params : Bytes[]      // Any remaining witness arguments.
}

interface TxSizeData {
  size   : number       // Size of the transaction in bytes.
  bsize  : number       // Base size of the tx (without witness data).
  vsize  : number       // Size of the tx with witness discount applied.
  weight : number       // Used to calculate the vsize of the tx.
}

type SequenceData = string | number
type LockData     = number
type ScriptData   = Bytes  | Word[]
type Word         = string | number | Uint8Array
type Bytes        = string | Uint8Array
```

#### Transaction Object

This is an example transaction in JSON format.

```ts
const txdata = {
  version: 2
  vin: [
    {
      txid: '1351f611fa0ae6124d0f55c625ae5c929ca09ae93f9e88656a4a82d160d99052',
      vout: 0,
      prevout: { 
        value: 10000,
        scriptPubkey: '512005a18fccd1909f3317e4dd7f11257e4428884902b1c7466c34e7f490e0e627da'
        
      },
      sequence: 0xfffffffd,
      witness: []
    }
  ],
  vout: [
    { 
      value: 9000, 
      address: 'bcrt1pqksclnx3jz0nx9lym4l3zft7gs5gsjgzk8r5vmp5ul6fpc8xyldqaxu8ys'
    }
  ],
  locktime: 0
}
```

## Example Transactions

Here are a few partial examples to help demonstrate using the library. Check out the [`test/example/taproot`](test/example/taproot/) directory to see a full implementation of each example.

Please feel free to contribute more!

### Basic Pay-to-Pubkey Spending

Full example: [keyspend.test.ts](test/example/taproot/keyspend.test.ts)

```ts
// Create a keypair to use for testing.
const secret = 'ccd54b99acec77d0537b01431579baef998efac6b08e9564bc3047b20ec1bb4c'
const seckey = new SecretKey(secret, { type: 'taproot' })
const pubkey = seckey.pub

// For key spends, we need to get the tweaked versions
// of the secret key and public key.
const [ tseckey ] = Tap.getSecKey(seckey)
const [ tpubkey ] = Tap.getPubKey(pubkey)

// Optional: You could also derive the public key from the tweaked secret key.
const _tpubkey_example = new SecretKey(tseckey).pub.x.hex

// A taproot address is simply the tweaked public key, encoded in bech32 format.
const address = Address.p2tr.fromPubKey(tpubkey, 'regtest')

/* NOTE: To continue with this example, send 100_000 sats to the above address.
  You will also need to make a note of the txid and vout of that transaction,
  so that you can include that information below in the redeem tx.
*/ 

const txdata = Tx.create({
  vin  : [{
    // Use the txid of the funding transaction used to send the sats.
    txid: '1ec5b5403bbc7f26a5d3a3ee30d69166a19fa81b49928f010af38fa96986d472',
    // Specify the index value of the output that you are going to spend from.
    vout: 1,
    // Also include the value and script of that ouput.
    prevout: {
      // Feel free to change this if you sent a different amount.
      value: 100_000,
      // This is what our address looks like in script form.
      scriptPubKey: [ 'OP_1', tpubkey ]
    },
  }],
  vout : [{
    // We are leaving behind 1000 sats as a fee to the miners.
    value: 99_000,
    // This is the new script that we are locking our funds to.
    scriptPubKey: Address.toScriptPubKey('bcrt1q6zpf4gefu4ckuud3pjch563nm7x27u4ruahz3y')
  }]
})

// For this example, we are signing for input 0 of our transaction,
// using the tweaked secret key.
const sig = Signer.taproot.sign(tseckey, txdata, 0)

// Let's add this signature to our witness data for input 0.
txdata.vin[0].witness = [ sig ]

// Check if the signature and transaction are valid.
const isValid = await Signer.taproot.verify(txdata, 0)
```
### Basic Pay-to-TapScript

Full example: [tapscript.test.ts](test/example/taproot/tapscript.test.ts)

```ts
const secret = '0a7d01d1c2e1592a02ea7671bb79ecd31d8d5e660b008f4b10e67787f4f24712'
const seckey = new SecretKey(secret, { type: 'taproot' })
const pubkey = seckey.pub

// Specify a basic script to use for testing.
const script = [ pubkey, 'OP_CHECKSIG' ]
const sbytes = Script.encode(script)

// For tapscript spends, we need to convert this script into a 'tapleaf'.
const tapleaf = Tap.tree.getLeaf(sbytes)

// Optional: There is a convenience method that converts scripts directly.
const _tapleaf = Tap.encodeScript(script)

// Generate a tapkey that includes our leaf script. Also, create a merlke proof 
// (cblock) that targets our leaf and proves its inclusion in the tapkey.
const [ tpubkey, cblock ] = Tap.getPubKey(pubkey, { target: tapleaf })

// A taproot address is simply the tweaked public key, encoded in bech32 format.
const address = Address.p2tr.fromPubKey(tpubkey, 'regtest')

/* NOTE: To continue with this example, send 100_000 sats to the above address.
  You will also need to make a note of the txid and vout of that transaction,
  so that you can include that information below in the redeem tx.
*/ 

const txdata = Tx.create({
  vin  : [{
    // Use the txid of the funding transaction used to send the sats.
    txid: '181508e3be1107372f1ffcbd52de87b2c3e7c8b2495f1bc25f8cf42c0ae167c2',
    // Specify the index value of the output that you are going to spend from.
    vout: 0,
    // Also include the value and script of that ouput.
    prevout: {
      // Feel free to change this if you sent a different amount.
      value: 100_000,
      // This is what our address looks like in script form.
      scriptPubKey: [ 'OP_1', tpubkey ]
    },
  }],
  vout : [{
    // We are leaving behind 1000 sats as a fee to the miners.
    value: 99_000,
    // This is the new script that we are locking our funds to.
    scriptPubKey: Address.toScriptPubKey('bcrt1q6zpf4gefu4ckuud3pjch563nm7x27u4ruahz3y')
  }]
})

// For this example, we are signing for input 0 of our transaction,
// using the untweaked secret key. We are also extending the signature 
// to include a commitment to the tapleaf script that we wish to use.
const sig = Signer.taproot.sign(seckey, txdata, 0, { extension: tapleaf })

// Add the signature to our witness data for input 0, along with the script
// and merkle proof (cblock) for the script.
txdata.vin[0].witness = [ sig.hex, script, cblock ]

// Check if the signature is valid for the provided public key, and that the
// transaction is also valid (the merkle proof will be validated as well).
const isValid = await Signer.taproot.verify(txdata, 0, { pubkey })
```

### Create / Spend from a Tree of Scripts

Full example: [taptree.test.ts](test/example/taproot/taptree.test.ts)

```ts
// Create a keypair to use for testing.
const secret = '0a7d01d1c2e1592a02ea7671bb79ecd31d8d5e660b008f4b10e67787f4f24712'
const seckey = new SecretKey(secret, { type: 'taproot' })
const pubkey = seckey.pub

// Specify an array of scripts to use for testing.
const scripts = [
  [ 1, 7, 'OP_ADD', 8, 'OP_EQUALVERIFY', pubkey, 'OP_CHECKSIG' ],
  [ 2, 6, 'OP_ADD', 8, 'OP_EQUALVERIFY', pubkey, 'OP_CHECKSIG' ],
  [ 3, 5, 'OP_ADD', 8, 'OP_EQUALVERIFY', pubkey, 'OP_CHECKSIG' ],
  [ 4, 4, 'OP_ADD', 8, 'OP_EQUALVERIFY', pubkey, 'OP_CHECKSIG' ],
  [ 5, 3, 'OP_ADD', 8, 'OP_EQUALVERIFY', pubkey, 'OP_CHECKSIG' ],
  [ 6, 2, 'OP_ADD', 8, 'OP_EQUALVERIFY', pubkey, 'OP_CHECKSIG' ],
  [ 7, 1, 'OP_ADD', 8, 'OP_EQUALVERIFY', pubkey, 'OP_CHECKSIG' ]
]

// Convert our array of scripts into tapleaves.
const tree = scripts.map(s => Tap.encodeScript(s))

// Pick one of our scripts as a target for spending.
const index  = Math.floor(Math.random() * 10) % 7
const script = scripts[index]
const target = Tap.encodeScript(script)

// Generate a tapkey that includes our tree. Also, create a merlke proof 
// (cblock) that targets our leaf and proves its inclusion in the tapkey.
const [ tpubkey, cblock ] = Tap.getPubKey(pubkey, { tree, target })

// A taproot address is simply the tweaked public key, encoded in bech32 format.
const address = Address.p2tr.fromPubKey(tpubkey, 'regtest')

/* NOTE: To continue with this example, send 100_000 sats to the above address.
 * You will also need to make a note of the txid and vout of that transaction,
 * so that you can include that information below in the redeem tx.
 */ 

const txdata = Tx.create({
  vin  : [{
    // Use the txid of the funding transaction used to send the sats.
    txid: 'e0b1b0aea95095bf7e113c37562a51cb8c3f50f5145c17952e766f7a84fcc5d7',
    // Specify the index value of the output that you are going to spend from.
    vout: 0,
    // Also include the value and script of that ouput.
    prevout: {
      // Feel free to change this if you sent a different amount.
      value: 100_000,
      // This is what our address looks like in script form.
      scriptPubKey: [ 'OP_1', tpubkey ]
    },
  }],
  vout : [{
    // We are leaving behind 1000 sats as a fee to the miners.
    value: 99_000,
    // This is the new script that we are locking our funds to.
    scriptPubKey: Address.toScriptPubKey('bcrt1q6zpf4gefu4ckuud3pjch563nm7x27u4ruahz3y')
  }]
})

// For this example, we are signing for input 0 of our transaction,
// using the untweaked secret key. We are also extending the signature 
// to include a commitment to the tapleaf script that we wish to use.
const sig = Signer.taproot.sign(seckey, txdata, 0, { extension: target })

// Add the signature to our witness data for input 0, along with the script
// and merkle proof (cblock) for the script.
txdata.vin[0].witness = [ sig.hex, script, cblock ]

// Check if the signature is valid for the provided public key, and that the
// transaction is also valid (the merkle proof will be validated as well).
const isValid = await Signer.taproot.verify(txdata, 0, { pubkey })
```

### Create / Publish an Inscription

Creating an inscription is a three-step process:
 1. We create a script for publishing the inscription, and convert it into a bitcoin address.
 2. Send funds to the bitcoin address.
 3. Create a redeem transaction, which claims the previous funds (and publishes the data).

Full example: [inscribe.test.ts](test/example/taproot/inscribe.test.ts)

```ts
// The 'marker' bytes. Part of the ordinal inscription format.
const marker   = Buff.encode('ord')
/* Specify the media type of the file. Applications use this when rendering 
  * content. See: https://developer.mozilla.org/en-US/docs/Glossary/MIME_type 
  */
const mimetype = Buff.encode('image/png')
// Create a keypair to use for testing.
const secret = '0a7d01d1c2e1592a02ea7671bb79ecd31d8d5e660b008f4b10e67787f4f24712'
const seckey = new SecretKey(secret, { type: 'taproot' })
const pubkey = seckey.pub
// Basic format of an 'inscription' script.
const script  = [ pubkey, 'OP_CHECKSIG', 'OP_0', 'OP_IF', marker, '01', mimetype, 'OP_0', imgdata, 'OP_ENDIF' ]
// For tapscript spends, we need to convert this script into a 'tapleaf'.
const tapleaf = Tap.encodeScript(script)
// Generate a tapkey that includes our leaf script. Also, create a merlke proof 
// (cblock) that targets our leaf and proves its inclusion in the tapkey.
const [ tpubkey, cblock ] = Tap.getPubKey(pubkey, { target: tapleaf })
// A taproot address is simply the tweaked public key, encoded in bech32 format.
const address = Address.p2tr.fromPubKey(tpubkey, 'regtest')

/* NOTE: To continue with this example, send 100_000 sats to the above address.
 * You will also need to make a note of the txid and vout of that transaction,
 * so that you can include that information below in the redeem tx.
 */ 

const txdata = Tx.create({
  vin  : [{
    // Use the txid of the funding transaction used to send the sats.
    txid: 'b8ed81aca92cd85458966de90bc0ab03409a321758c09e46090988b783459a4d',
    // Specify the index value of the output that you are going to spend from.
    vout: 0,
    // Also include the value and script of that ouput.
    prevout: {
      // Feel free to change this if you sent a different amount.
      value: 100_000,
      // This is what our address looks like in script form.
      scriptPubKey: [ 'OP_1', tpubkey ]
    },
  }],
  vout : [{
    // We are leaving behind 1000 sats as a fee to the miners.
    value: 99_000,
    // This is the new script that we are locking our funds to.
    scriptPubKey: Address.toScriptPubKey('bcrt1q6zpf4gefu4ckuud3pjch563nm7x27u4ruahz3y')
  }]
})

// For this example, we are signing for input 0 of our transaction,
// using the untweaked secret key. We are also extending the signature 
// to include a commitment to the tapleaf script that we wish to use.
const sig = Signer.taproot.sign(seckey, txdata, 0, { extension: tapleaf })

// Add the signature to our witness data for input 0, along with the script
// and merkle proof (cblock) for the script.
txdata.vin[0].witness = [ sig, script, cblock ]

// Check if the signature is valid for the provided public key, and that the
// transaction is also valid (the merkle proof will be validated as well).
const isValid = await Signer.taproot.verify(txdata, 0, { pubkey, throws: true })

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
The swiss-army-knife of byte manipulation.  
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
This is a guide on how to use a command-line tool called btcdeb and Tap.  
This tool will help you create a taproot transaction from scratch, which  
is great for learning (and to debug any issues with this library :-)).  
https://github.com/bitcoin-core/btcdeb/blob/master/doc/tapscript-example-with-tap.md

## License

Use this library however you want!

## Contact

You can find me on twitter at `@btctechsupport` or on nostr at `npub1gg5uy8cpqx4u8wj9yvlpwm5ht757vudmrzn8y27lwunt5f2ytlusklulq3`