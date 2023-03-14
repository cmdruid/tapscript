# BTON
A basic library for working with Bitcoin transaction data.

## How to Import
```html
<script src="https://unpkg.com/@cmdcode/tapscript"></script>
<script> const BTON = window.bton </script>
```
```ts
import * as BTON from '@cmdcode/tapscript'
```

## How to Use

The BTON library provides a number of tools for working with bitcoin script.

### Script Tool.

This tool helps with parsing / serializing scripts.

```ts
BTON.script = {
  // Encode a JSON formatted script into hex.
  encode : (script : ScriptData, varint = true) => string,
  // Decode a hex formatted script into JSON.
  decode : (script : string) => ScriptData
}
```

### Signature Tool.

This tool helps with signatures and validation.

```ts
BTON.sig.taproot = {
  // Calculate the signature hash for a transaction.
  hash : (
    txdata  : TxData | string | Uint8Array,
    index   : number,
    config  : HashConfig = {}
  ) => Promise<Uint8Array>,
  // Sign a transaction using your *tweaked* private key.
  sign : (
    prvkey  : string | Uint8Array,
    txdata  : TxData | string | Uint8Array,
    index   : number,
    config  : HashConfig = {}
  ) => Promise<Uint8Array>,
  // Verify a transaction using the included tapkey (or specify a pubkey).
  verify : (
    txdata  : TxData | string | Uint8Array,
    index   : number,
    config  : HashConfig = {},
    shouldThrow = false
  ) => Promise<boolean>
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

### Tap Tool

This tool helps with creating a tree of scripts / data, plus creating the proofs to validate / spend them.

```ts
BTON.tap = {
  // Returns a 'hashtag' used for padding. Mainly for internal use.
  getTag : (tag : string) => Promise<Uint8Array>,

  // Returns a 'tapleaf' used for building a tree. 
  getLeaf : (
    data     : string | Uint8Array,
    version ?: number
  ) => Promise<string>,

  // Returns a 'branch' which combines two leaves (or branches).
  getBranch : (
    leafA : string,
    leafB : string
  ) => Promise<string>,

  // Returns the root hash of a tree.
  getRoot : (
    leaves : TapTree
  ) => Promise<Uint8Array>,

  // Returns the 'control block' path needed for validating a tapleaf.
  getPath : (
    pubkey  : string | Uint8Array,
    target  : string,
    taptree : TapTree = [ target ],
    version ?: number 
    parity  ?: 0 | 1  
  ) : Promise<string>,

  // Checks if a path is valid for a given tapleaf.
  checkPath : (
    tapkey : string | Uint8Array,
    cblock : string | Uint8Array,
    target : string
  ) => Promise<boolean>,

  // Encodes a public key into a taproot address.
  encodeAddress : (
    tapkey : string | Uint8Array,
    prefix ?: string
  ) => string,

  // Decodes a taproot address into a public key.
  decodeAddress : (
    address : string
  ) => Uint8Array
}
```

### Tweak Tool

This tool helps with tweaking public / secret (private) keys.

```ts
BTON.tweak = {
  // Return a tweaked private key using the provided TapTree.
  getSeckey : (
    seckey : string | Uint8Array,
    leaves : TapTree = []
  ) => Promise<string>,

  // Return a tweaked public key using the provided TapTree.
  getPubkey : (
  pubkey : string | Uint8Array,
  leaves : TapTree = []
) : Promise<TapKey>,

  // Return a 'taptweak' which is used for key tweaking.
  getTweak : (
    pubkey : string | Uint8Array,
    tweak  : string | Uint8Array
  ) => Promise<Uint8Array>,

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

### Tx Tool.

This tool helps with parsing / serializing transaction data.

```ts
BTON.tx = {
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

## Example Transaction Object

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

## Bugs / Issues
If you run into any bugs or have any questions, please submit an issue ticket.

## Contribution
Feel free to fork and make contributions. Suggestions are welcome!

## License
Use this library however you want!
